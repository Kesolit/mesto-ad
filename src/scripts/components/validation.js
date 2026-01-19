const showInputError = ({
  formElement,
  inputElement,
  inputErrorClass,
  errorClass,
  errorMessage
}) => {
  const errorElement = formElement.querySelector(`#${inputElement.id}-error`);
  inputElement.classList.add(inputErrorClass);
  errorElement.textContent = errorMessage;
  errorElement.classList.add(errorClass);
};

const hideInputError = ({
  formElement,
  inputElement,
  inputErrorClass,
  errorClass
}) => {
  const errorElement = formElement.querySelector(`#${inputElement.id}-error`);
  inputElement.classList.remove(inputErrorClass);
  errorElement.textContent = "";
  errorElement.classList.remove(errorClass);
};

const checkInputValidity = ({
  formElement,
  inputElement,
  inputErrorClass,
  errorClass
}) => {
  if (!inputElement.validity.valid) {
    if (inputElement.validity.patternMismatch) {
      const customMessage = inputElement.dataset.errorMessage;
      showInputError({
        formElement,
        inputElement,
        inputErrorClass,
        errorClass,
        errorMessage: customMessage || inputElement.validationMessage
      });
    } else {
      showInputError({
        formElement,
        inputElement,
        inputErrorClass,
        errorClass,
        errorMessage: inputElement.validationMessage
      });
    }
  } else {
    hideInputError({
      formElement,
      inputElement,
      inputErrorClass,
      errorClass
    });
  }
};

const hasInvalidInput = (inputList) => {
  return Array.from(inputList).some((inputElement) => {
    return !inputElement.validity.valid;
  });
};

const disableSubmitButton = ({
  submitButtonElement,
  inactiveButtonClass
}) => {
  submitButtonElement.classList.add(inactiveButtonClass);
  submitButtonElement.disabled = true;
};

const enableSubmitButton = ({
  submitButtonElement,
  inactiveButtonClass
}) => {
  submitButtonElement.classList.remove(inactiveButtonClass);
  submitButtonElement.disabled = false;
};

const toggleButtonState = ({
  inputList,
  submitButtonElement,
  inactiveButtonClass
}) => {
  if (hasInvalidInput(inputList)) {
    disableSubmitButton({ submitButtonElement, inactiveButtonClass });
  } else {
    enableSubmitButton({ submitButtonElement, inactiveButtonClass });
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

export const clearValidation = ({
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

  disableSubmitButton({
    submitButtonElement,
    inactiveButtonClass
  });
};

export const enableValidation = ({
  formSelector,
  inputSelector,
  submitButtonSelector,
  inactiveButtonClass,
  inputErrorClass,
  errorClass
}) => {
  const formList = Array.from(document.querySelectorAll(formSelector));

  formList.forEach((formElement) => {
    setEventListeners({
      formElement,
      inputSelector,
      inputErrorClass,
      submitButtonSelector,
      inactiveButtonClass,
      errorClass
    });
  });
};

export const clearValidationSimple = (formElement, settings) => {
  clearValidation({
    formElement,
    ...settings
  });
};
