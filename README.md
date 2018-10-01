# Muninn

<img align="right"  alt="Muninn" src="muninn.png"> Muninn is simple JavaScript script for tracking web page views. The script was forked from [cdn.simpleanalytics.io](https://github.com/bacinger/cdn.simpleanalytics.io). 

Muninn collect minimum information for simple analytics. It consists out of a small JavaScript (`muninn.js`) that gathers the data, and on the back-end is AWS Lambda (`index.js`). 

The whole idea of this project is to take the tracking and data into your own hands, and to move away from the big tracking companies. The second motivation is to learn new technologies, primarily serverless back-end services. For personal use on a non-popular website, I hope the Amazon free tier will be sufficient.

## Instalation

Just put these two files with your web application, and add the following two lines at the end of your `index.html` file:
```
<script type="text/javascript" src="path_to/muninn.js"></script> 
<noscript><img src="https://url.to.your.lambda.com/api" alt=""></noscript>
```