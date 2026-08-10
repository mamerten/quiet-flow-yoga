#!/usr/bin/env python3
"""
Pre-generates the app's narration audio with a local neural TTS (Piper),
so every device hears the same natural-sounding voice instead of whatever
robotic engine the OS happens to ship.

The clip list is derived from public/js/poses.js, so the audio can never
drift out of sync with the pose library. Output goes to public/audio/ as
mono Opus-in-WebM (tiny, and supported everywhere the app runs), plus a
manifest.json mapping clip key -> filename.

This is a BUILD-TIME tool. It is not shipped to the browser and the app
has no runtime dependency on Python, Piper, or ffmpeg.

Usage:
    pip install piper-tts imageio-ffmpeg
    python tools/generate-voice.py                 # generate everything
    python tools/generate-voice.py --voice en_US-amy-medium
    python tools/generate-voice.py --force         # re-render existing clips
"""

import argparse
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
POSES_JS = os.path.join(ROOT, "public", "js", "poses.js")
AUDIO_ROOT = os.path.join(ROOT, "public", "audio")

# Voice packs shipped with the app. Ids must match window.VOICE_PACKS in
# public/js/voice.js.
VOICE_PACKS = {
    "lessac": "en_US-lessac-high",
    "amy": "en_US-amy-medium",
}

# >1.0 slows delivery down; a yoga cue read at default speed sounds rushed.
DEFAULT_LENGTH_SCALE = 1.15

# Fixed lines the app speaks that don't come from the pose library.
STATIC_LINES = {
    "complete": "Great job. You completed your practice. Namaste.",
    "preview": "Mountain Pose. Stand tall, and take a deep breath in, and out.",
}

# Pose names end in a bare Roman numeral (Warrior I/II/III) per yoga
# convention, which is the right way to *display* them but the wrong way
# to *say* them: TTS reads a lone "I" as the pronoun/letter, and "II"/"III"
# as nonsense. Instructors say "Warrior One/Two/Three" out loud, so the
# narration text gets that conversion; the on-screen text (js/app.js
# poseLabel) is untouched. Keep this in sync with spokenPoseName() there.
ROMAN_TO_WORD = {"I": "One", "II": "Two", "III": "Three"}


def spoken_name(name):
    return re.sub(r"\b(III|II|I)$", lambda m: ROMAN_TO_WORD[m.group(1)], name)


def parse_poses(path):
    """Pull id/name/cue/sided out of poses.js without needing a JS runtime."""
    with open(path, encoding="utf-8") as f:
        src = f.read()

    poses = []
    # Each entry looks like: { id: '...', name: '...', ..., cue: '...' }
    for block in re.findall(r"\{[^{}]*?\bid:\s*'[^']+'[^{}]*?\}", src, re.S):
        def field(key):
            m = re.search(
                r"\b%s:\s*(['\"])(.*?)(?<!\\)\1" % key, block, re.S)
            if not m:
                return None
            return m.group(2).replace("\\'", "'").replace('\\"', '"')

        pid, name, cue = field("id"), field("name"), field("cue")
        if pid and name and cue:
            poses.append({
                "id": pid,
                "name": name,
                "cue": cue,
                "sided": bool(re.search(r"\bsided:\s*true", block)),
            })
    return poses


def build_clips(poses):
    """Map of clip key -> text to speak. Keys match what js/voice.js asks for.

    One-sided poses get left/right variants so the narration actually tells
    you which side you're working — the whole point of mirroring them.
    """
    clips = dict(STATIC_LINES)
    for p in poses:
        name = spoken_name(p["name"])
        variants = [("", "")] if not p["sided"] else [
            ("-left", ", left side"), ("-right", ", right side")]
        for suffix, spoken in variants:
            label = "%s%s" % (name, spoken)
            clips["name-%s%s" % (p["id"], suffix)] = label
            clips["next-%s%s" % (p["id"], suffix)] = "Up next: %s" % label
            clips["cue-%s%s" % (p["id"], suffix)] = "%s. %s" % (label, p["cue"])
    return clips


def ffmpeg_exe():
    exe = shutil.which("ffmpeg")
    if exe:
        return exe
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except Exception:
        sys.exit("ffmpeg not found. Install it, or: pip install imageio-ffmpeg")


def generate_pack(pack_id, model_name, clips, args, ff):
    out_dir = os.path.join(AUDIO_ROOT, pack_id)
    os.makedirs(out_dir, exist_ok=True)

    model = os.path.join(args.data_dir, model_name + ".onnx")
    if not os.path.exists(model):
        print("Downloading voice %s ..." % model_name)
        subprocess.run([sys.executable, "-m", "piper.download_voices",
                        model_name, "--data-dir", args.data_dir], check=True)

    manifest = {"voice": model_name, "format": "webm", "clips": {}}
    made = 0

    for i, (key, text) in enumerate(sorted(clips.items()), 1):
        # Content-addressed filenames: editing a cue produces a new file and
        # sidesteps any stale caching of the old audio.
        digest = hashlib.sha1(
            ("%s|%s|%s" % (model_name, args.length_scale, text)).encode("utf-8")
        ).hexdigest()[:10]
        fname = "%s.%s.webm" % (key, digest)
        outpath = os.path.join(out_dir, fname)
        manifest["clips"][key] = fname

        if os.path.exists(outpath) and not args.force:
            continue

        with tempfile.TemporaryDirectory() as td:
            wav = os.path.join(td, "out.wav")
            subprocess.run(
                [sys.executable, "-m", "piper", "-m", model_name,
                 "--data-dir", args.data_dir,
                 "--length-scale", str(args.length_scale), "-f", wav],
                input=text.encode("utf-8"), check=True,
                stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            subprocess.run(
                [ff, "-y", "-i", wav, "-ac", "1", "-c:a", "libopus",
                 "-b:a", "24k", "-application", "voip", outpath],
                check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        made += 1
        if made % 20 == 0:
            print("    ... %d rendered" % made)

    # Drop any files no longer referenced (e.g. after editing a cue).
    keep = set(manifest["clips"].values()) | {"manifest.json"}
    for f in os.listdir(out_dir):
        if f not in keep:
            os.remove(os.path.join(out_dir, f))

    with open(os.path.join(out_dir, "manifest.json"), "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)

    total = sum(os.path.getsize(os.path.join(out_dir, f))
                for f in os.listdir(out_dir))
    print("  %s (%s): %d clips, %d newly rendered, %.2f MB"
          % (pack_id, model_name, len(clips), made, total / 1024 / 1024))
    return total


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--pack", action="append",
                    help="only build these pack ids (default: all)")
    ap.add_argument("--data-dir", default=os.path.join(HERE, ".voices"),
                    help="where Piper voice models are cached")
    ap.add_argument("--length-scale", type=float, default=DEFAULT_LENGTH_SCALE)
    ap.add_argument("--force", action="store_true",
                    help="re-render clips even if they already exist")
    args = ap.parse_args()

    poses = parse_poses(POSES_JS)
    if not poses:
        sys.exit("No poses parsed from %s" % POSES_JS)
    clips = build_clips(poses)
    sided = sum(1 for p in poses if p["sided"])
    print("%d poses (%d one-sided) -> %d clips per voice"
          % (len(poses), sided, len(clips)))

    os.makedirs(args.data_dir, exist_ok=True)
    os.makedirs(AUDIO_ROOT, exist_ok=True)
    ff = ffmpeg_exe()

    wanted = args.pack or list(VOICE_PACKS)
    total = 0
    for pack_id in wanted:
        if pack_id not in VOICE_PACKS:
            sys.exit("Unknown pack %r (known: %s)"
                     % (pack_id, ", ".join(VOICE_PACKS)))
        total += generate_pack(pack_id, VOICE_PACKS[pack_id], clips, args, ff)

    print("\nDone. %.2f MB total in public/audio/" % (total / 1024 / 1024))


if __name__ == "__main__":
    main()
