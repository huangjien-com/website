import {
  Avatar,
  Button,
  Dropdown,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Tooltip,
  ModalFooter,
  useDisclosure,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@nextui-org/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BiHide, BiShow, BiUser } from 'react-icons/bi';
import { useAuth } from '../lib/useAuth';

const Login = () => {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedKey, setSelectedKey] = useState();
  const { error, user, login, isAuthenticated, logout } = useAuth();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => setIsVisible(!isVisible);

  useEffect(() => {
    if (!selectedKey) return;
    if (selectedKey.toLowerCase() === 'logout') {
      logout();
      setSelectedKey(undefined);
    }

    setSelectedKey(undefined);
  }, [selectedKey, logout]);

  return (
    <>
      {!user?.name && (
        <>
          <Tooltip content={t('header.login')}>
            <Button
              className="bg-transparent  text-success"
              auto
              shadow
              onPress={onOpen}
            >
              <BiUser size="2em" />
            </Button>
          </Tooltip>
          <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            placement="top-center"
          >
            <ModalContent>
              {(onClose) => (
                <>
                  <ModalHeader className="flex flex-col gap-1">
                    {t('header.login_promote')}
                  </ModalHeader>
                  <ModalBody>
                    <Input
                      autoFocus
                      endContent={
                        <BiUser className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
                      }
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      label="Email"
                      placeholder="Enter your github user name"
                      variant="bordered"
                    />
                    <Input
                      endContent={
                        <button
                          className="focus:outline-none"
                          type="button"
                          onClick={toggleVisibility}
                        >
                          {isVisible ? (
                            <BiHide className="text-2xl text-default-400 pointer-events-none" />
                          ) : (
                            <BiShow className="text-2xl text-default-400 pointer-events-none" />
                          )}
                        </button>
                      }
                      type={isVisible ? 'text' : 'password'}
                      label="Password"
                      onChange={(e) => setPassword(e.target.value)}
                      value={password}
                      placeholder="Enter your github token"
                      variant="bordered"
                    />
                  </ModalBody>
                  <ModalFooter>
                    <Button color="danger" variant="flat" onPress={onClose}>
                      {t('header.close')}
                    </Button>
                    <Button
                      color="primary"
                      onPress={() => login(username, password)}
                    >
                      {t('header.login')}
                    </Button>
                  </ModalFooter>
                </>
              )}
            </ModalContent>
          </Modal>
        </>
      )}
      {user && user.avatar_url
        ? user && (
            <Dropdown placement="bottom-left">
              <DropdownTrigger>
                <Avatar
                  isBordered
                  showFallback
                  fallback={<BiUser />}
                  alt={user.name}
                  text={user.name}
                  src={user.avatar_url}
                />
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Avatar Actions"
                onAction={setSelectedKey}
              >
                <DropdownItem key="email" textValue={user.email}>
                  <p color="inherit">{user.email}</p>
                </DropdownItem>

                <DropdownItem
                  key="logout"
                  withDivider
                  color="error"
                  textValue="Log Out"
                >
                  {t('header.logout')}
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          )
        : user && <p href="#"> {user.name} </p>}
    </>
  );
};

export default Login;
