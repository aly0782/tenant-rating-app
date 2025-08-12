import React from 'react';
import { IconButton, useColorMode, useColorModeValue, Tooltip } from '@chakra-ui/react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';

export const DarkModeToggle: React.FC = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const SwitchIcon = useColorModeValue(MoonIcon, SunIcon);
  const nextMode = useColorModeValue('dark', 'light');

  return (
    <Tooltip label={`Switch to ${nextMode} mode`} closeOnClick={false}>
      <IconButton
        size="md"
        fontSize="lg"
        variant="ghost"
        color="current"
        marginLeft="2"
        onClick={toggleColorMode}
        icon={<SwitchIcon />}
        aria-label={`Switch to ${nextMode} mode`}
        _hover={{
          bg: useColorModeValue('gray.200', 'gray.700'),
        }}
      />
    </Tooltip>
  );
};