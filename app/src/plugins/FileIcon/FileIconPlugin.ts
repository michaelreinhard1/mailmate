export default {
  install(app: any) {
    app.config.globalProperties.$fileIcon = (fileType: string) => {
      switch (true) {
        case fileType.includes("svg"):
          return "/icons/icons8-ai.svg";
        case fileType.includes("image"):
          return "/icons/icons8-image-file.svg";
        case fileType.includes("pdf"):
          return "/icons/icons8-pdf.svg";
        case fileType.includes("audio"):
          return "/icons/icons8-audio-file.svg";
        case fileType.includes("video"):
          return "/icons/icons8-video-file.svg";
        case fileType.includes("zip"):
          return "/icons/icons8-zip.svg";
        case fileType === "text/javascript":
          return "/icons/icons8-code-file.svg";
        case fileType === "application/x-msdownload":
          return "/icons/icons8-exe.svg";
        case fileType.includes("text"):
          return "/icons/icons8-document.svg";
        default:
          return "/icons/icons8-default.svg";
      }
    };
  },
};
