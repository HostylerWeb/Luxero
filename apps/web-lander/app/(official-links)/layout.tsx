import "../links-home.css";

export default function OfficialLinksLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link rel="stylesheet" href="/links/theme.css" />
      <link rel="stylesheet" href="/links/assets/montserrat.css" />
      <link rel="stylesheet" href="/links/assets/cormorant.css" />
      <link rel="stylesheet" href="/links/style.css" />
      {children}
    </>
  );
}
