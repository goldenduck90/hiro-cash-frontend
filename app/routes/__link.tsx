import { Container, Content, Footer } from "./header";
import hiro from "~/assets/images/hiro.png";

export default function LinkLayout() {
  return (
    <Container>
      <>
        {/*
        This example requires updating your template:

        ```
        <html class="h-full bg-gray-100">
        <body class="h-full">
        ```
      */}
        <div className="pb-24">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
            <div className="relative mb-5 flex items-center justify-center  pt-5 pb-2 lg:justify-between">
              <div className="absolute left-0 flex-shrink-0 lg:static">
                <a href="/">
                  <span className="sr-only">Hiro</span>
                  <img className="h-8 w-auto" src={hiro} alt="Hiro" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </>
      <Content />
      <Footer />
    </Container>
  );
}
