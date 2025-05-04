"use client";

import { Toaster as ChakraToaster, Portal, Spinner, Stack, Toast, createToaster } from "@chakra-ui/react";

export const toaster = createToaster({
  placement: "bottom-end",
  pauseOnPageIdle: true,
  max: 3,
  duration: 10000,
});

const Toaster = () => {
  return (
    <Portal>
      <ChakraToaster toaster={toaster} insetInline={{ mdDown: "4" }}>
        {(toast) => (
          <Toast.Root flex="1" width={{ md: "lg" }} p={3} borderRadius="md" boxShadow="md">
            {toast.type === "loading" ? <Spinner size="sm" color="blue.solid" /> : <Toast.Indicator />}

            <Stack gap="2" flex="1" maxWidth="100%" h={"auto"}>
              {toast.title && <Toast.Title>{toast.title}</Toast.Title>}
              {toast.description && (
                <Toast.Description whiteSpace="pre-wrap" wordBreak="break-word" maxH="350px" overflowY="auto">
                  {toast.description}
                </Toast.Description>
              )}
            </Stack>

            {toast.action && <Toast.ActionTrigger>{toast.action.label}</Toast.ActionTrigger>}
            {toast.meta?.closable && <Toast.CloseTrigger />}
          </Toast.Root>
        )}
      </ChakraToaster>
    </Portal>
  );
};

export default Toaster;
