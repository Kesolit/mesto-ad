const showInputError = ({
    formElement,
    inputElement,
    inputErrorClass,
    errorClass,
    errorMessage
}) => {
    const errorElement = formElement.querySelector(`.${inputElement.id}-error`);
    errorElement.classList.add(errorClass);
    errorElement.textContent = errorMessage;

    inputElement.classList.add(inputErrorClass);
};


const hideInputError = ({
    formElement,
    inputElement,
    inputErrorClass,
    errorClass
}) => {
    const errorElement = formElement.querySelector(`.${inputElement.id}-error`);
    errorElement.classList.remove(errorClass);
    errorElement.textContent = "";

    inputElement.classList.remove(inputErrorClass);
};


const checkInputValidity = ({
    formElement,
    inputElement,
    inputErrorClass,
    errorClass
}) => {
    if(!inputElement.validity.valid) {
        showInputError({
            formElement,
            inputElement,
            errorMessage: inputElement.validationMessage,
            errorClass,
            inputErrorClass
        });
    } else {
        hideInputError({
            formElement,
            inputElement,
            errorClass,
            inputErrorClass
        });
    }

    if(inputElement.validity.patternMismatch) {
        inputElement.setCustomValidity(inputElement.dataset.errorMessage);
    } else {
        inputElement.setCustomValidity("");
    }
};


const hasInvalidInput = (inputList) => {
    return inputList.some((inputElement) => {
        return !inputElement.validity.valid;
    });
};


const disableSubmitButton = ({
    submitButtonElement,
    inactiveButtonClass
}) => {
    submitButtonElement.disabled = true;
    submitButtonElement.classList.add(inactiveButtonClass);
};


const enableSubmitButton = ({
    submitButtonElement,
    inactiveButtonClass
}) => {
    submitButtonElement.disabled = false;
    submitButtonElement.classList.remove(inactiveButtonClass);
};


const toggleButtonState = ({
    inputList,
    submitButtonElement,
    inactiveButtonClass
}) => {
    if(hasInvalidInput(inputList)) {
        disableSubmitButton({submitButtonElement, inactiveButtonClass});
    } else {
        enableSubmitButton({submitButtonElement, inactiveButtonClass});
    }
};


const setEventListeners = ({
    formElement,
    inputSelector,
    inputErrorClass,
    submitButtonSelector,
    inactiveButtonClass,
    errorClass
}) => {
    const inputList = Array.from(formElement.querySelectorAll(inputSelector));
    const submitButtonElement = formElement.querySelector(submitButtonSelector);

    toggleButtonState({
        inputList,
        submitButtonElement,
        inactiveButtonClass
    });

    inputList.forEach((inputElement) => {
        inputElement.addEventListener('input', () => {
            checkInputValidity({
                formElement,
                inputElement,
                inputErrorClass,
                errorClass
            });
            toggleButtonState({
                inputList,
                submitButtonElement,
                inactiveButtonClass
            });
        });
    });
};


const clearValidation = ({
    formElement,
    submitButtonSelector,
    inactiveButtonClass,
    inputSelector,
    inputErrorClass,
    errorClass
}) => {
    const inputList = Array.from(formElement.querySelectorAll(inputSelector));
    const submitButtonElement = formElement.querySelector(submitButtonSelector);

    inputList.forEach((inputElement) => {
        hideInputError({
            formElement,
            inputElement,
            inputErrorClass,
            errorClass
        });
    });

    toggleButtonState({
        inputList,
        submitButtonElement,
        inactiveButtonClass
    });
};


const enableValidation = ({
    formSelector,
    inputSelector,
    submitButtonSelector,
    inactiveButtonClass,
    inputErrorClass,
    errorClass
}) => {
    const formList = document.querySelectorAll(formSelector);

    formList.forEach((formElement) => {
        formElement.addEventListener('submit', (evt) => {
            evt.preventDefault();
        });
        setEventListeners({
            formElement,
            inputSelector,
            submitButtonSelector,
            inactiveButtonClass,
            inputErrorClass,
            errorClass
        });
    });
};


export { enableValidation, clearValidation };