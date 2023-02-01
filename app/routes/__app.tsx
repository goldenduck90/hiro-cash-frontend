import { Outlet } from "@remix-run/react";
import { Container, Header, Content, Footer } from "./header";

export default function AppLayout() {
  return (
    <Container>
      <Header />
      <Content />
      <Footer />
    </Container>
  );
}
