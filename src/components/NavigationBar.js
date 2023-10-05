'use client';
import {
  Navbar,
  NavbarContent,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@nextui-org/react';
import { Button } from '@nextui-org/button';
import { Kbd } from '@nextui-org/kbd';
import { Link } from '@nextui-org/link';
import { Spacer } from '@nextui-org/spacer';
import { Input } from '@nextui-org/input';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image } from '@nextui-org/image';
import {
  BiChip,
  BiCog,
  BiDetail,
  BiGlobe,
  BiHome,
  BiMoon,
  BiSun,
} from 'react-icons/bi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../lib/useAuth';
import { useSettings } from '../lib/useSettings';
import { languages } from '../locales/i18n';
import Login from './Login';
import { siteConfig } from '../config/site';
import clsx from 'clsx';
import { useTheme } from 'next-themes';
import { ThemeSwitch } from './ThemeSwitch';
import { LanguageSwitch } from './LanguageSwitch';

export const NavigationBar = () => {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  return (
    <Navbar
      id="main_header"
      isBordered={theme === 'dark'}
      variant="sticky"
      css={{
        $$navbarBackgroundColor: 'transparent',
        $$navbarBlurBackgroundColor: 'transparent',
      }}
    >
      <NavbarBrand>
        <Dropdown aria-label="main_dropdown">
          <DropdownTrigger>
            <Image src="/favicon.png" alt='brand' isZoomed width={32} height={32} />
          </DropdownTrigger>
          <DropdownMenu
            className="sm:block md:block lg:hidden font-bold text-inherit"
            aria-label="main_dropdown_menu"
            disallowEmptySelection
            selectionMode="single"
          >
            <DropdownItem>
              <Link href="/" underline="active">
                <BiHome size="2em" /> {t('header.home')}
              </Link>
            </DropdownItem>
            <DropdownItem>
              <Link href="/ai" underline="active">
                <BiChip size="2em" /> {t('header.ai')}
              </Link>
            </DropdownItem>
            <DropdownItem>
              <Link href="/settings" underline="active">
                <BiCog size="2em" /> {t('header.settings')}
              </Link>
            </DropdownItem>
            <DropdownItem>
              <Link href="/about" underline="active">
                <BiDetail size="2em" /> {t('header.about')}
              </Link>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </NavbarBrand>
      <NavbarContent className="font-bold text-inherit text-primary">
        <NavbarItem className="hidden lg:block ">
          <Link href="/">
            <BiHome size="2em" /> {t('header.home')}
          </Link>
        </NavbarItem>
        <NavbarItem className="hidden lg:block">
          <Link href="/ai" underline="active">
            <BiChip size="2em" /> {t('header.ai')}
          </Link>
        </NavbarItem>
        <NavbarItem className="hidden lg:block">
          <Link href="/settings" underline="active">
            <BiCog size="2em" /> {t('header.settings')}
          </Link>
        </NavbarItem>
        <NavbarItem className="hidden lg:block">
          <Link href="/about" underline="active">
            <BiDetail size="2em" /> {t('header.about')}
          </Link>
        </NavbarItem>
        <Spacer x={4} className="hidden lg:block" />
        <Login className="hidden lg:block" />
        <ThemeSwitch className="hidden lg:block" />
        <LanguageSwitch className="hidden lg:block" />
        <ToastContainer
          position={toast.POSITION.TOP_CENTER}
          autoClose={5000}
          limit={3}
          pauseOnHover
          closeOnClick
          theme={theme === 'dark' ? 'dark' : 'light'}
          draggable
        />
      </NavbarContent>
    </Navbar>
  );
};
