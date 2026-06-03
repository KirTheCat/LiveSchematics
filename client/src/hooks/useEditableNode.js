import { useState, useEffect, useRef } from 'react';

export const useEditableNode = (initialLabel, data, id) => {
    const [isEditing, setIsEditing] = useState(false);
    const [label, setLabel] = useState(initialLabel || '');
    const inputRef = useRef(null);

    useEffect(() => {
        if (!isEditing) {
            setLabel(initialLabel || '');
        }
    }, [initialLabel, isEditing]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleBlur = () => {
        setIsEditing(false);
        data.label = label;
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
            handleBlur();
        }
        if (e.key === 'Escape') {
            setLabel(initialLabel || '');
            setIsEditing(false);
        }
    };

    return {
        isEditing,
        label,
        setLabel,
        inputRef,
        wrapperProps: {
            onDoubleClick: () => setIsEditing(true)
        },
        inputProps: {
            ref: inputRef,
            value: label,
            onChange: (e) => setLabel(e.target.value),
            onBlur: handleBlur,
            onKeyDown: handleKeyDown
        }
    };
};