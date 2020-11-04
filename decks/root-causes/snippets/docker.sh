docker run -it \
    -e JUPYTER_ENABLE_LAB=true \
    --rm \
    -d \
    --name jlab \
    -p 8888:8888 \
    jupyterlabbenchmarks/jlab-2-2-8:latest

docker run -it \
    -e JUPYTER_ENABLE_LAB=true \
    --rm \
    -d \
    --name jlab \
    -p 8888:8888 \
    jupyterlabbenchmarks/jlab-virtual-notebook:latest

docker run -it \
    -e JUPYTER_ENABLE_LAB=true \
    --rm \
    -d \
    --name jlab \
    -p 8888:8888 \
    jupyterlabbenchmarks/jlab-virtual-notebook-window:latest

docker run -it \
    -e JUPYTER_ENABLE_LAB=true \
    --rm \
    -d \
    --name jlab \
    -p 8888:8888 \
    jupyterlabbenchmarks/jlab-delayout:latest
