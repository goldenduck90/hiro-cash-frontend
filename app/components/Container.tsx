import clsx from "clsx";

export function Container(props: any) {
  if (props.className) {
    // eslint-disable-next-line no-unused-vars
    const { className, ...rest } = props;

    return (
      <div
        className={clsx("mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", className)}
        {...rest}
      />
    );
  } else {
    return (
      <div
        className={clsx("mx-auto max-w-7xl px-4 sm:px-6 lg:px-8")}
        {...props}
      />
    );
  }
}
