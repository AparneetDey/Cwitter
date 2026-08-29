import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import EmojiPicker, { Theme } from 'emoji-picker-react';

const EmojiPickerPopover = ({ isOpen, onClose, onEmojiClick, triggerRef }) => {
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const popoverRef = useRef(null);

  useEffect(() => {
    if (isOpen && triggerRef?.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const pickerHeight = 380;
      const spaceBelow = viewportHeight - rect.bottom;

      // Determine smart position: place above if space below is too small
      const placeAbove = spaceBelow < pickerHeight && rect.top > pickerHeight;

      const calculatedLeft = Math.max(12, Math.min(rect.left, window.innerWidth - 332));
      const calculatedTop = placeAbove
        ? Math.max(12, rect.top - pickerHeight - 8)
        : Math.min(viewportHeight - pickerHeight - 12, rect.bottom + 8);

      setCoords({
        left: calculatedLeft,
        top: calculatedTop,
      });
    }
  }, [isOpen, triggerRef]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        isOpen &&
        popoverRef.current &&
        !popoverRef.current.contains(e.target) &&
        triggerRef?.current &&
        !triggerRef.current.contains(e.target)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('resize', onClose);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', onClose);
    };
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      ref={popoverRef}
      style={{
        position: 'fixed',
        top: `${coords.top}px`,
        left: `${coords.left}px`,
        zIndex: 99999,
      }}
      className="shadow-2xl rounded-2xl overflow-hidden border border-[#2f3336] bg-black animate-scale-up"
      onClick={(e) => e.stopPropagation()}
    >
      <EmojiPicker
        theme={Theme.DARK}
        onEmojiClick={(emojiData, event) => {
          onEmojiClick(emojiData, event);
        }}
        width={320}
        height={370}
        lazyLoadEmojis={true}
      />
    </div>,
    document.body
  );
};

export default EmojiPickerPopover;
