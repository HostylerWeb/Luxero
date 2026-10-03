export default {
  component: LoadingComponent,
  layout: LayoutLoading,
};

function LoadingComponent() {
  return <div className="p-4" />;
}

function LayoutLoading() {
  return <div className="min-h-screen" />;
}
