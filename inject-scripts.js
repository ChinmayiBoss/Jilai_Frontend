const fs = require('fs');
const path = require('path');

const twitterScript = `
  <!-- Twitter conversion tracking base code -->
  <script>
    !function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments);
    },s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,u.src='https://static.ads-twitter.com/uwt.js',
    a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a))}(window,document,'script');
    twq('config','ppe1z');
  </script>
  <!-- End Twitter conversion tracking base code -->
`;

const gtmScript = `
  <!-- Google Tag Manager -->
  <script>
    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id=GTM-KN7TBW2Q';f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','GTM-KN7TBW2Q');
  </script>
  <!-- End Google Tag Manager -->
`;

const gtmNoScript = `
  <noscript>
    <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-KN7TBW2Q"
    height="0" width="0" style="display:none;visibility:hidden"></iframe>
  </noscript>
`;

const isProduction = process.argv.includes('--prod');

if (isProduction) {
  const indexPath = path.resolve(__dirname, './dist/jilai/browser/index.html');
  let indexContent = fs.readFileSync(indexPath, 'utf8');

  // Inject scripts into placeholders
  indexContent = indexContent.replace(
    '<!-- SCRIPT_PLACEHOLDER -->',
    `${twitterScript}\n${gtmScript}`
  );
  indexContent = indexContent.replace(
    '<!-- NOSCRIPT_PLACEHOLDER -->',
    gtmNoScript
  );

  // Write the modified index.html back to the dist folder
  fs.writeFileSync(indexPath, indexContent, 'utf8');
  console.log('Production scripts injected into index.html');
} else {
  console.log('Development build: No scripts injected');
}