import Image from "next/image";

import { Container } from "~/components/Container";
// import backgroundImage from "@/images/background-faqs.jpg";

const faqs = [
  [
    {
      answer:
        "ENS does not work on other chains, like Avalanche, Fantom, Polygon. And you will also miss out on other features like notifications, automations, insta-dex.",
      question: "I could just use my ENS domain.",
    },
    {
      answer:
        "You could, but you have to copy/paste addresses, explain the sender what tokens you accept on what chain, do test transactions, check if tokens arrived. Hiro link, it's just set it and forget it.",
      question: "How is this better than normal ERC20 transfer?",
    },
  ],
  [
    {
      answer:
        "Hiro charges a payment fee for B2C payments. The fees will be distributed to the $HIRO token stakers.",
      question: "How will you make money? ",
    },
    {
      answer:
        "The receiver selects the tokens/chains he accepts, and the sender picks the one he wants to pay with. Hiro swaps the tokens if needed.",
      question: "What tokens can I use to pay?",
    },
  ],
  [
    {
      answer:
        "Yes. You can use the same address you deposit tokens on an exchange. It works with most major exchanges.",
      question: "Can I send tokens directly to an exchange",
    },
    {
      answer:
        "Hiro will deploy to all chains. We do not bridge tokens across chains.",
      question: "Are you multi-chain?",
    },
  ],
];

export function Faq() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="relative overflow-hidden bg-slate-900 py-20 sm:py-32"
    >
      {/* <Image
        className="absolute top-0 left-1/2 max-w-none translate-x-[-30%] -translate-y-1/4"
        src={backgroundImage}
        alt=""
        width={1558}
        height={946}
        unoptimized
      /> */}
      <Container className="relative">
        <div className="mx-auto w-full text-center lg:mx-0">
          <h2
            id="faq-title"
            className="font-display text-3xl tracking-tight text-indigo-50 sm:text-4xl"
          >
            Frequently asked questions
          </h2>
          <p className="mt-4  text-lg tracking-tight text-slate-200">
            If you can’t find what you’re looking for, join our Discord and ask.
          </p>
        </div>
        <ul
          role="list"
          className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3"
        >
          {faqs.map((column, columnIndex) => (
            <li key={columnIndex}>
              <ul role="list" className="flex flex-col gap-y-8">
                {column.map((faq, faqIndex) => (
                  <li key={faqIndex}>
                    <h3 className="font-display text-lg leading-7 text-indigo-200">
                      {faq.question}
                    </h3>
                    <p className="text-md mt-4 text-slate-50">{faq.answer}</p>
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
