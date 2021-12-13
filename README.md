## GRD powered by Express js

## Setup environment

Firstly, install on your linux distribution build package tools

```bash
sudo apt-get install build-essential
```

Next install docker and docker-compose

**Install Docker on Linux systems🔗**

- Update the apt package index and install packages to allow apt to use a repository over HTTPS:

```bash
sudo apt-get update

sudo apt-get install \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg-agent \
    software-properties-common
```

- Add Docker’s official GPG key:

```bash
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
``` 

- Verify that you now have the key with the fingerprint 9DC8 5822 9FC7 DD38 854A  E2D8 8D81 803C 0EBF CD88, by searching for the last 8 characters of the fingerprint.

```bash
sudo apt-key fingerprint 0EBFCD88

pub   rsa4096 2017-02-22 [SCEA]
      9DC8 5822 9FC7 DD38 854A  E2D8 8D81 803C 0EBF CD88
uid           [ unknown] Docker Release (CE deb) <docker@docker.com>
sub   rsa4096 2017-02-22 [S]
```

- Use the following command to set up the stable repository. 

```bash
 sudo add-apt-repository \
   "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
   $(lsb_release -cs) \
   stable"
```

- Update the apt package index, and install the latest version of Docker Engine and containerd, or go to the next step to install a specific version:

```bash
 sudo apt-get update
 sudo apt-get install docker-ce docker-ce-cli containerd.io
```

**Install Compose on Linux systems🔗**

`For alpine, the following dependency packages are needed: py-pip, python-dev, libffi-dev, openssl-dev, gcc, libc-dev, and make.`

- Run this command to download the current stable release of Docker Compose:

```bash
sudo curl -L "https://github.com/docker/compose/releases/download/1.26.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
```

- Apply executable permissions to the binary:

```bash
sudo chmod +x /usr/local/bin/docker-compose
sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose
```

- Test the installation.

```bash
docker-compose --version
docker-compose version 1.26.1, build 1110ad01
```

- How to install node.js on ubuntu, you can see clicked following [link](https://g.zeos.in/?q=How%20To%20Install%20Node.js%20on%20Ubuntu)

- Go to application directory and run following command

```bash
npm i
```

## Usage

Run application

```bash
make up
```

Build application in production mode

```bash
make up MODE=PROD
```

Getting information about which ports used by containers

```bash
make ps
```

Run tests

```bash
npm run test
```

Start application in develop mode

```bash
npm run dev
```

Start app
```bash
npm start
```