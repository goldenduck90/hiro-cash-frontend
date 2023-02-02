import type {
  ActionFunction,
  LoaderArgs,
  LoaderFunction,
} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";
import { findOauthCredential } from "~/models/oauthCredential.server";
import { getChain, routerlist, tokenlist } from "@hiropay/tokenlists";
import { authenticator } from "~/services/auth.server";

import {
  useField,
  ValidatedForm,
  validationError,
  ValidatorData,
} from "remix-validated-form";
import { withZod } from "@remix-validated-form/with-zod";
import { z } from "zod";
import { zfd } from "zod-form-data";

import invariant from "tiny-invariant";
import {
  createWallet,
  deleteWallet,
  updateWallet,
} from "~/models/wallet.server";
import type { Wallet } from ".prisma/client";
import { useIsSubmitting } from "remix-validated-form";

import ethereumLogo from "~/assets/images/chains/ethereum.svg";

const coins = tokenlist.tokens;

const coinsByChain: any = {};
coins.forEach((c) => {
  if (coinsByChain[c.chainId]) {
    coinsByChain[c.chainId].push(c);
  } else {
    coinsByChain[c.chainId] = [c];
  }
});

const filteredChainIds: number[] = [];
routerlist.routers.forEach((routerInfo) => {
  if (routerInfo.version == "0.1") {
    if (!filteredChainIds.includes(routerInfo.chainId)) {
      filteredChainIds.push(routerInfo.chainId);
    }
  }
});

export const validator = withZod(
  z.object({
    address: z.string().min(2, { message: "address is required" }),
    coins: zfd.repeatable(
      z.array(zfd.text()).min(1, { message: "select at least one coin" })
    ),
    // lastName: z
    //   .string()
    //   .min(1, { message: "Last name is required" }),
    // email: z
    //   .string()
    //   .min(1, { message: "Email is required" })
    //   .email("Must be a valid email"),
  })
);

export const action: ActionFunction = async ({
  request,
  params,
}: ActionArgs) => {
  let oauthCredential = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  let oauth = await findOauthCredential(
    oauthCredential.provider,
    oauthCredential.userId
  );

  let account = oauth.accounts.find(
    (account) => account.username === params.id
  );
  invariant(account, "account not found");

  // const userId = await requireUserId(request);
  const result = await validator.validate(await request.formData());
  // if (result.error) return validationError(result.error);
  const data = result.data;

  console.log(data);

  const address = data["address"];
  await createWallet(account, address, {
    type: params.type,
    exchange: params.exchange,
    config: {
      coins: data["coins"],
    },
  });

  return redirect(`../${account.username}`);
};
