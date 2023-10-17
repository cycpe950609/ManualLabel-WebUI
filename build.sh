#!/usr/bin/bash
python -m compileall server
mkdir -p manuallabel-webui-runtime/server/ 
cp run.sh ./manuallabel-webui-runtime
cp ./server/__pycache__/*.pyc ./manuallabel-webui-runtime/server/server.pyc
cp public ./manuallabel-webui-runtime/ -r
shar -M -D -Q manuallabel-webui-runtime/ | head -n -1 > manuallabel-webui.sh && echo "manuallabel-webui-runtime/run.sh" >> manuallabel-webui.sh