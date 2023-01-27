// shared template

import { Fragment } from 'react'
import { Form, Outlet } from  "@remix-run/react";
import { Menu, Popover, Transition } from '@headlessui/react'
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid'
import { useOptionalOauth } from '~/utils';
import hiro from "~/assets/images/hiro.png";



export function MainContainer() {
  const oauth = useOptionalOauth();
  return (
    <>
      {/*
        This example requires updating your template:

        ```
        <html class="h-full bg-gray-100">
        <body class="h-full">
        ```
      */}
      <div className="min-h-full bg-slate-900">
        <div className="pb-24">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
            <div className="relative flex items-center justify-center py-5 lg:justify-between">
              {/* Logo */}
              <div className="absolute left-0 flex-shrink-0 lg:static">
                <a href="/">
                  <span className="sr-only">Hiro</span>
                  <img
                    className="h-8 w-auto"
                    src={hiro}
                    alt="Hiro"
                  />
                </a>
              </div>
                {oauth && (              
                  <Form action="/auth/logout" method="post">
                    <button
                      type="submit"
                      className="rounded text-xs py-1 px-2 text-blue-100 hover:bg-slate-500 active:bg-slate-600"
                    >
                      Logout
                    </button>
                  </Form>
                    )}

            </div>
          </div>
        </div>
        <Content />
        <Footer />
  
      </div>
    </>
  )
}

export function Content() {
  return (
        <main className="-mt-24 pb-8">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
            <h1 className="sr-only">Hiro</h1>
            {/* Main 3 column grid */}
            <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3 lg:gap-8">
              {/* Left column */}
              <div className="grid grid-cols-1 gap-4 lg:col-span-2">
                <section>
                  <div className="overflow-hidden rounded-lg bg-slate-800 shadow text-white p-6">
                    <Outlet />
                  </div>
                </section>
              </div>    
          </div> 
          </div>
        </main>
  );
}


export function Footer() {
  return (
        <footer>
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
            <div className="border-t border-slate-800 py-8 text-center text-sm text-gray-500 sm:text-left">
              <span className="block sm:inline">&copy; 2023 Bitvit</span>{' '}
              <span className="block sm:inline">All rights reserved.</span>
            </div>
          </div>
        </footer>
        );
}