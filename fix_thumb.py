import urllib.request
import re
import json
import subprocess
import os

def get_yt_dlp_thumbnail(url):
    try:
        result = subprocess.run(['/Users/sumin/Library/Python/3.9/bin/yt-dlp', '--get-thumbnail', url], capture_output=True, text=True, check=True)
        return result.stdout.strip().split('\n')[-1] # Usually the last line is the URL, though warnings might precede
    except Exception as e:
        print(f"Error yt-dlp on {url}: {e}")
        return None

def download_image(url, filename):
    try:
        urllib.request.urlretrieve(url, filename)
        print(f"Downloaded {filename}")
    except Exception as e:
        print(f"Error downloading {filename}: {e}")

# test 56
url_56 = "https://www.instagram.com/reel/DUsIfnhEs4y"
thumb_url = get_yt_dlp_thumbnail(url_56)
if thumb_url:
    print(f"URL: {thumb_url}")
    download_image(thumb_url, 'thumbnails/thumb_56.jpg')

url_137 = "https://www.threads.net/@1ndian2wins/post/DU-TO8VEqKd"
thumb_url = get_yt_dlp_thumbnail(url_137)
if thumb_url:
    print(f"URL: {thumb_url}")
    download_image(thumb_url, 'thumbnails/thumb_137.jpg')

