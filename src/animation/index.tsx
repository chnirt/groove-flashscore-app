import { ReactNode } from "react";
import { motion } from "framer-motion";

export const FadeFramer = ({
  pathname,
  children,
}: {
  pathname: string;
  children: ReactNode;
}) => {
  const pageVariants = {
    initial: {
      opacity: 0,
    },
    in: {
      opacity: 1,
    },
    out: {
      opacity: 0,
    },
  };

  const pageTransition = {
    type: "tween",
    ease: "linear",
    duration: 0.5,
  };

  return (
    <motion.div
      key={pathname}
      initial="initial"
      animate="in"
      variants={pageVariants}
      transition={pageTransition}
    >
      {children}
    </motion.div>
  );
};
