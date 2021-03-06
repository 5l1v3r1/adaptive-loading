/*
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { useState } from 'react';
import Head from 'next/head';
import { AnimatePresence } from 'framer-motion';
import { useMemoryStatus } from 'react-adaptive-hooks/memory';

import Layout from '../components/Layout';
import { AnimationEmulationContext } from '../contexts';
import { DEVICE_MEMORY_LIMIT, DEFAULT_DEVICE_MEMORY_LIMIT } from '../config';

const MyApp = ({ Component, pageProps, router }) => {
  const { clientHintDeviceMemory } = pageProps;

  const [manualEnabled, setManualEnabled] = useState(false);
  const [isAnimationOn, setIsAnimationOn] = useState(true);
  const {
    deviceMemory,
    unsupported,
    ...performanceMemoryStatus
  } = useMemoryStatus({deviceMemory: clientHintDeviceMemory || DEFAULT_DEVICE_MEMORY_LIMIT});

  console.log('[MyApp] deviceMemory, clientHintDeviceMemory, performanceMemoryStatus => ', deviceMemory, clientHintDeviceMemory, performanceMemoryStatus);

  const overLoaded = parseInt(deviceMemory, 10) < DEVICE_MEMORY_LIMIT;

  const memoryStatus = {
    deviceMemory,
    overLoaded,
    unsupported,
    ...performanceMemoryStatus
  };

  let animationAllowed;
  if (manualEnabled) {
    animationAllowed = isAnimationOn;
  } else {
    animationAllowed = !overLoaded;
  }

  const enableManualAnimationHandler = flag => {
    setManualEnabled(flag);
  };

  const toggleAnimationHandler = event => {
    setIsAnimationOn(event.target.checked);
  };

  return (
    <>
      <Head>
        <meta httpEquiv='Accept-CH' content='DPR, Width, Viewport-Width, ECT, Device-Memory' />
        <meta httpEquiv='Accept-CH-Lifetime' content='86400' />
      </Head>
      <AnimationEmulationContext.Provider
        value={{
          manualEnabled,
          isAnimationOn,
          animationAllowed,
          enableManualAnimationHandler,
          toggleAnimationHandler
        }}>
        <Layout memoryStatus={memoryStatus}>
          { animationAllowed ? (
            <AnimatePresence exitBeforeEnter>
              <Component {...pageProps} key={router.route} />
            </AnimatePresence>
          ) : (
            <Component {...pageProps} key={router.route} />
          ) }
        </Layout>
      </AnimationEmulationContext.Provider>
    </>
  )
};

MyApp.getInitialProps = async ({ Component, ctx }) => {
  let pageProps;
  if (Component.getInitialProps) {
    pageProps = await Component.getInitialProps(ctx);
  }
  const clientHintDeviceMemory = ctx.req ? ctx.req.headers['device-memory'] : null;
  pageProps = {...pageProps, clientHintDeviceMemory};
  return {pageProps};
};

export default MyApp;
