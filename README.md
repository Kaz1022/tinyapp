# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly). The purpose of a URL shortener is to make a URL more manageable. 

## Final Product

!["Screenshot of your URLs page"](https://github.com/Kaz1022/tinyapp/blob/main/docs/urls-page.png?raw=true)


## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session


## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.
- Go to http://localhost:8080/urls on your browser.

## Register/ Login
- You can create your account with your `email` and `password` on [Register](http://localhost:8080/register) page.
- If you already have an account, the app will redirect you to [Login](http://localhost:8080/login) page.
!["Screenshot of Register page"](https://github.com/Kaz1022/tinyapp/blob/main/docs/register-page.png?raw=true)


## Create TinyURL
- Once you are logged in, you can create TinyURL on [Create New URL](http://localhost:8080/urls/new) page.
!["Screenshot of Creat New URL page"](https://github.com/Kaz1022/tinyapp/blob/main/docs/createUrl-page.png?raw=true)

## Edit/Delete your URL
- You can see the list of your URLs on [My URLs](http://localhost:8080/urls/new) page where you can edit and delete your URLs.

- To edit your long URL, hit the edit button from [My URLs](http://localhost:8080/urls/new) and you will see your current URL and edit secion like below. Once you submit your new URL, you will be redirected to [MyURLs](http://localhost:8080/urls/new) page with updated information.
!["Screenshot of shortURL id page"](https://github.com/Kaz1022/tinyapp/blob/main/docs/id-page.png?raw=true)













