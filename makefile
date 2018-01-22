all:
	-apt update -y
	-apt install curl -y
	-curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.8/install.sh | bash
	- source ~/.bashrc
	-nvm install 8 
	-npm install