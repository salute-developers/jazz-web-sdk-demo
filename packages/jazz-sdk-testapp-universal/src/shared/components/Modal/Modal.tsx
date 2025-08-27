import { FC } from 'react';

import { IconButton, ModalBase } from '@salutejs/plasma-b2c';
import { IconClose } from '@salutejs/plasma-icons';
import styled from 'styled-components/macro';

export const ModalPaper = styled.div`
  background: #fff;
  box-shadow: 0 5px 18px #0000002e;
  border-radius: 16px;
  overflow: hidden;
  position: relative;
`;

export const ModalBody = styled(ModalPaper)`
  padding: 32px;
  max-height: 100vh;
  overflow-y: auto;
  box-sizing: border-box;
`;

const CustomIconButton = styled(IconButton)`
  position: absolute;
  right: 16px;
  top: 16px;
`;

export type ModalProps = {
  className?: string;
  isOpen: boolean;
  onClose: () => void;
  disableBodyCloseButton?: boolean;
  disableBody?: boolean;
  children?: React.ReactNode;
};

export const Modal: FC<ModalProps> = ({
  className,
  isOpen,
  onClose,
  children,
  disableBody = false,
  disableBodyCloseButton = false,
}) => {
  return (
    <ModalBase opened={isOpen} onClose={onClose}>
      {disableBody ? (
        children
      ) : (
        <ModalBody className={className}>
          {!disableBodyCloseButton && (
            <CustomIconButton onClick={onClose} size="l" view="clear">
              <IconClose size="m" />
            </CustomIconButton>
          )}
          {children}
        </ModalBody>
      )}
    </ModalBase>
  );
};
