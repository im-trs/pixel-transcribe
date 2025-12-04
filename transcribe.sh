#!/bin/zsh

# Check if input file is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <audio_file>"
  exit 1
fi

AUDIO_FILE="$1"

# Create virtual environment if it doesn't exist
if [ ! -d "whisper-venv" ]; then
  echo "Creating virtual environment..."
  python3 -m venv whisper-venv
fi

# Activate virtual environment
source whisper-venv/bin/activate

# Install whisper if not already installed
if ! pip show whisper >/dev/null 2>&1; then
  echo "Installing Whisper..."
  pip install git+https://github.com/openai/whisper.git >/dev/null 2>&1
fi

# Run Whisper transcription

# Create transcriptions directory if it doesn't exist
if [ ! -d "transcriptions" ]; then
  mkdir transcriptions
fi

whisper "$AUDIO_FILE" --model small --output_dir transcriptions