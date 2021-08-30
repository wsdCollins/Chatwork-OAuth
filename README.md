# Chatwork-OAuth

This is a sample repo for connecting to and using OAuth with Chatwork. This
repository will cover the scope of creating a new application, getting approval
or denial from a user. And concluding with getting a token on behalf of the 
user. This repository is not intended to cover the finer points of connecting
to OAuth, only to serve as a practical coding guide for connecting to 
Chatwork as an OAuth provider.

## Step 01 - Creating a Domain Name

To start we will need a domain with https to host our application on. In this case we will
use *+cw.wsdlab.com**. First we will add a DNS entry for the subdomain. 

![Screenshot 2021-08-30 at 09-57-47 Advanced DNS](https://user-images.githubusercontent.com/5259968/131271825-85231c0a-2aa4-49a7-9af8-d1b063b6001c.png)

Then we need to create an Nginx configuration to serve the site. 

```
# vim /etc/nginx/conf.d/cw.wsdlab.com.conf
--- Paste the Following content ---
server {

    listen 80;
    listen [::]:80;

    index index.html;
    server_name cw.wsdlab.com;

    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme; #http pr https
    proxy_set_header X-Real-IP $remote_addr; #client IP address
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

    location ^~ /.well-known/acme-challenge/ {
        root /var/www/html;
        default_type "text/plain";
    }

    location / {
        #try_files $uri $uri/ =404;
        proxy_pass http://localhost:4000;
    }

}
--- Write and Quit ---
```

And then we restart nginx to implement the changes before calling certbot
to get a certificate from Let's Encrypt.

```
# systemctl restart nginx
# certbot --nginx -d cw.wsdlab.com
```

Once this is complete, you should have a valid https connection that returns
a 502 error page because we have not set up a server to reverse proxy to. 
We will do that in Step 03.

## Step 02 - Create an OAuth Client

Login into Chatwork, and click on the top right hand menu. Then click on "Integrations".

![Screenshot from 2021-08-30 10-13-35](https://user-images.githubusercontent.com/5259968/131272379-69f384df-1f02-41a9-bf83-f64415b73ce8.png)

From the on the right hand menu click on OAuth, and then in the OAuth page, click on the 
button that says "Create New".

![Screenshot from 2021-08-30 10-14-53](https://user-images.githubusercontent.com/5259968/131272430-8968b842-a6c9-4c6a-915b-2158f1521ce6.png)

Note that in the link provided for the OAuth Docmentation is an English PDF with some incomplete
information, I recoment using the Japanese documentation which can be found here: https://developer.chatwork.com/ja/.

![Screenshot from 2021-08-30 10-20-17](https://user-images.githubusercontent.com/5259968/131272796-b544d8ff-a9fc-4d49-8d27-674d28de616f.png)

From there we will enter the details for our OAuth client applicaiton. We will set the "Client Name" as "WSD Hello World", we will include a logo for the Icon, for the "Client Type" we will select " Confidential", and for the "Redirect URI" we will specify "https://cw.wsdlab.com/oauth/chatwork". 

After that we need to select the checkboxes for which permissions we will use from the application. In our case, we're only interested in reading or writing files. So We'll selected the scopes for basic account information, ability to read rooms, ability to read files from rooms, and ability to write files to rooms. If needed, the scopes and callbacks can be edited later. Once we're done, we click "Create" at the bottom.

![Screenshot from 2021-08-30 10-24-34](https://user-images.githubusercontent.com/5259968/131273014-684ae378-fece-46a8-9220-79664e19c856.png)

Once that is complete, we should see this screen.

![Screenshot from 2021-08-30 10-26-02](https://user-images.githubusercontent.com/5259968/131273103-462c0b04-0a68-40f6-85c7-980c997771a1.png)

Make a note of the Client ID and Client Secret at the bottom. These will be needed in the next step to authencate our server to get tokens.

## Step 03 - Create Application

First we clone this repository

```
# git clone https://github.com/wsdCollins/Chatwork-OAuth.git
# cd Chatwork-OAuth
# npm install
```

Then we need to add our client id and client seecret to the dotenv file. Replace the values
with your client id and client secret from the last step (without the square brackets).

```
# echo "CLIENT_ID=[YOUR_CLIENT_ID]" > .env
# echo "LIENT_SECRET=[YOUR_CLIENT_SECRET]" >> .env
```

From there we can run the server.

```
# node index.js
```

If we open up the browser to https://cw.wsdlab.com/, we should see a mockup integrations page.

![Screenshot from 2021-08-30 11-05-07](https://user-images.githubusercontent.com/5259968/131275414-9fb6dfcd-23e0-4ffe-b5d8-7bf1b84f8728.png)

If we click on the "Connect" under the "Chatwork" integration, it should take us to the OAuth approval page.

![Screenshot from 2021-08-30 11-06-09](https://user-images.githubusercontent.com/5259968/131275498-275f6e84-5011-4347-bb92-5f04f860a8e8.png)

If we click "Approve", it should take up to the callback page, where we get a token to use the applicaiton.

![Screenshot from 2021-08-30 11-07-39](https://user-images.githubusercontent.com/5259968/131275585-a127a9f6-35ac-4003-adfd-6e52048e1232.png)

And we get a token that will expire in a few minutes. 
