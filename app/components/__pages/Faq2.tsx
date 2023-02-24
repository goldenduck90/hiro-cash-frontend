import { Container } from "~/components/Container";
// import avatarImage1 from "@/images/avatars/avatar-1.png";
// import avatarImage2 from "@/images/avatars/avatar-2.png";
// import avatarImage3 from "@/images/avatars/avatar-3.png";
// import avatarImage4 from "@/images/avatars/avatar-4.png";
// import avatarImage5 from "@/images/avatars/avatar-5.png";

const testimonials = [
  [
    {
      content:
        "ENS does not work on other chains, like Avalanche, Fantom, Polygon. And you will also miss out on other features like notifications, automations, insta-dex.",
      author: {
        name: "I could just use my ENS domain.",
      },
    },
    {
      content:
        "You could, but you have to copy/paste addresses, explain the sender what tokens you accept on what chain, do test transactions, check if tokens arrived. Hiro link, it's just set it and forget it.",
      author: {
        name: "How is this better than normal ERC20 transfer?",
      },
    },
  ],
  [
    {
      content:
        "Hiro charges a payment fee for B2C payments. The fees will be distributed to the $HIRO token stakers.",
      author: {
        name: "How will you make money? ",
      },
    },
    {
      content:
        "The receiver selects the tokens/chains he accepts, and the sender picks the one he wants to pay with. Hiro swaps the tokens if needed.",
      author: {
        name: "What tokens can I use to pay?",
      },
    },
  ],
  [
    {
      content:
        "Yes. You can use the same address you deposit tokens on an exchange. It works with most major exchanges.",
      author: {
        name: "Can I send tokens directly to an exchange",
      },
    },
    {
      content:
        "Hiro will deploy to all chains. We do not bridge tokens across chains.",
      author: {
        name: "Are you multi-chain?",
      },
    },
  ],
];

function QuoteIcon(props: any) {
  return (
    <svg aria-hidden="true" width={105} height={78} {...props}>
      <path d="M25.086 77.292c-4.821 0-9.115-1.205-12.882-3.616-3.767-2.561-6.78-6.102-9.04-10.622C1.054 58.534 0 53.411 0 47.686c0-5.273.904-10.396 2.712-15.368 1.959-4.972 4.746-9.567 8.362-13.786a59.042 59.042 0 0 1 12.43-11.3C28.325 3.917 33.599 1.507 39.324 0l11.074 13.786c-6.479 2.561-11.677 5.951-15.594 10.17-3.767 4.219-5.65 7.835-5.65 10.848 0 1.356.377 2.863 1.13 4.52.904 1.507 2.637 3.089 5.198 4.746 3.767 2.41 6.328 4.972 7.684 7.684 1.507 2.561 2.26 5.5 2.26 8.814 0 5.123-1.959 9.19-5.876 12.204-3.767 3.013-8.588 4.52-14.464 4.52Zm54.24 0c-4.821 0-9.115-1.205-12.882-3.616-3.767-2.561-6.78-6.102-9.04-10.622-2.11-4.52-3.164-9.643-3.164-15.368 0-5.273.904-10.396 2.712-15.368 1.959-4.972 4.746-9.567 8.362-13.786a59.042 59.042 0 0 1 12.43-11.3C82.565 3.917 87.839 1.507 93.564 0l11.074 13.786c-6.479 2.561-11.677 5.951-15.594 10.17-3.767 4.219-5.65 7.835-5.65 10.848 0 1.356.377 2.863 1.13 4.52.904 1.507 2.637 3.089 5.198 4.746 3.767 2.41 6.328 4.972 7.684 7.684 1.507 2.561 2.26 5.5 2.26 8.814 0 5.123-1.959 9.19-5.876 12.204-3.767 3.013-8.588 4.52-14.464 4.52Z" />
    </svg>
  );
}

export function Faq() {
  return (
    <section
      id="faq"
      aria-label="Frequently asked questions"
      className="py-20 sm:py-32"
    >
      <Container>
        <div className="mx-auto max-w-2xl md:text-center">
          <h2 className="font-display text-3xl tracking-tight text-indigo-100 sm:text-4xl">
            F.A.Q.
          </h2>
        </div>
        <ul
          role="list"
          className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:gap-8 lg:mt-20 lg:max-w-none lg:grid-cols-3"
        >
          {testimonials.map((column, columnIndex) => (
            <li key={columnIndex}>
              <ul role="list" className="flex flex-col gap-y-6 sm:gap-y-8">
                {column.map((testimonial, testimonialIndex) => (
                  <li key={testimonialIndex}>
                    <figure className="relative rounded-2xl bg-slate-800 p-6 shadow-xl shadow-slate-900/10">
                      <figcaption className="">
                        <div className="font-display text-base font-bold text-slate-50">
                          {testimonial.author.name}
                        </div>
                      </figcaption>
                      <blockquote className="relative">
                        <p className="text-slate-100">{testimonial.content}</p>
                      </blockquote>
                    </figure>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
