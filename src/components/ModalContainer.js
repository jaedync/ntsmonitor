// ModalContainer.js
import React from 'react';
import Modal from 'react-modal';

Modal.setAppElement('#root'); // This line is needed for accessibility reasons

function ModalContainer({ isOpen, toggleModal, children }) {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={toggleModal}
      contentLabel="Info Modal"
      className="modal"
      overlayClassName="overlay"
    >
      <button onClick={toggleModal} className="close-button">×</button>
      {children}
    </Modal>
  );
}

export default ModalContainer;
