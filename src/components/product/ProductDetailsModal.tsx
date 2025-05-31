import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useColorModeValue
} from '@chakra-ui/react';
import { Product } from '../../types/product';
import ProductDetails from './ProductDetails';

interface ProductDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
  onApplyStrategy?: (productId: string) => void;
  onLinkCompetitors?: (productId: string) => void;
}

export default function ProductDetailsModal({
  isOpen,
  onClose,
  product,
  onEdit,
  onDelete,
  onApplyStrategy,
  onLinkCompetitors
}: ProductDetailsModalProps) {
  // Цвета для светлой/темной темы
  const modalBg = useColorModeValue('white', 'gray.800');

  if (!product) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="6xl"
      scrollBehavior="inside"
    >
      <ModalOverlay
        bg="blackAlpha.300"
        backdropFilter="blur(5px)"
      />
      <ModalContent
        bg={modalBg}
        borderRadius="xl"
        mx={4}
      >
        <ModalHeader>Информация о товаре</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <ProductDetails
            product={product}
            onEdit={onEdit}
            onDelete={onDelete}
            onApplyStrategy={onApplyStrategy}
            onLinkCompetitors={onLinkCompetitors}
          />
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>Закрыть</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
