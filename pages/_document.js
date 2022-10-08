import Document, { Html, Head, Main, NextScript } from 'next/document'

export default class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          {/* Global Site Tag (gtag.js) - Google Analytics */}
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=G-WJ5D66KF4X`}
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-WJ5D66KF4X', {
              page_path: window.location.pathname,
            });
          `,
            }}
          />

          {/* <script src='https://storage.ko-fi.com/cdn/scripts/overlay-widget.js'></script>
          <script dangerouslySetInnerHTML={{
              __html: `
              kofiWidgetOverlay.draw('gabekrahulik', {
                'type': 'floating-chat',
                'floating-chat.donateButton.text': 'Donate',
                'floating-chat.donateButton.background-color': '#323842',
                'floating-chat.donateButton.text-color': '#fff'
              });
          `,
            }}>
          </script> */}

        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}