const Component = (props) => {
  return console.log("JSX", props);
};
const hoc = (Component) => (props) => {
  const t = "abc";
  return <Component {...props} t={t} />;
};
