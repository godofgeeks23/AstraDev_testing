# Astra

## Setup

### Installing and Configuring NVM

We will be using NVM (node version manager) script for installing nodejs and npm on the server.

Get the script using curl - 

    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.2/install.sh | bash

or using wget - 

    wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.2/install.sh | bash
    

Running either of the above commands downloads a script and runs it. The script clones the nvm repository to `~/.nvm`, and attempts to add the source lines from the snippet below to the correct profile file (`~/.bash_profile`, `~/.zshrc`, `~/.profile`, or `~/.bashrc`).

    export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm


### Installing and Configuring Node and NPM

Now that the NVM installed, its time to install node now - 

    nvm install node # "node" is an alias for the latest version

NPM automatically gets installed from the above command.

### Fetching the source code

Get the source code on your local machine by using

    git clone https://github.com/shivbhProject/astra.git

And move to the source code directory

    cd ./astra

### Setting up Backend Server

Change directory to `server_alt`,

    cd ./server_alt

Install the required node modules,

    npm i
    
### Setting up Frontend Server

Change directory to `client`,

    cd ./client

Install the required node modules,

    npm i

This will install React and other required dependencies.

## Execution

### Starting the backend server

Change directory to `server_alt` and execute the following command -

    nodemon

The server is started, and if successfull, shows output as - 

    [nodemon] starting `node index.js`
    
    Backend server is live at port 3000!
    
    (node:16787) DeprecationWarning: collection.ensureIndex is deprecated. Use createIndexes instead.
    (Use `node --trace-deprecation ...` to show where the warning was created)
    
    Establishing connection with MongoDB - Success 

### Starting the Frontend server

Change directory to `client` and execute the following command -

    npm start

If the terminal shows output similar to - 

    ? Something is already running on port 3000. Probably:
      ... (pid 18089)
      ...
    
    Would you like to run the app on another port instead? › (Y/n)

Press `Y` to continue on another port. The server is then started and following output appears - 

    Compiled successfully!
    
    You can now view client in the browser.
    
      Local:            http://localhost:3001
      On Your Network:  http://192.168.20.37:3001
    
    Note that the development build is not optimized.
    To create a production build, use npm run build.
    
    webpack compiled successfully

