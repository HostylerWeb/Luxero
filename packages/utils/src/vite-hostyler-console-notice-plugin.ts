import { HOSTYLER_CONSOLE_NOTICE_INLINE } from "./hostyler-console-notice";

export function hostylerConsoleNoticeIndexHtmlPlugin() {
  return {
    name: "luxero-hostyler-console-notice",
    transformIndexHtml: {
      order: "pre",
      handler(html: string) {
        const snippet = `<script id="hostyler-console-notice">${HOSTYLER_CONSOLE_NOTICE_INLINE}</script>`;
        return html.replace(/<head>/i, `<head>\n    ${snippet}`);
      },
    },
  };
}
