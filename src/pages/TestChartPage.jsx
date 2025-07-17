import React from "react";
import ProgressChart from "../components/ProgressChart";
import { Box, Center } from "@chakra-ui/react";

export default function TestChartPage() {
  return (
    <Center py={10}>
      <Box w="100%" maxW="800px">
        <ProgressChart />
      </Box>
    </Center>
  );
}
