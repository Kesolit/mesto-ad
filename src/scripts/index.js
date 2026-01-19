/*
  Файл index.js является точкой входа в наше приложение
  и только он должен содержать логику инициализации нашего приложения
  используя при этом импорты из других файлов

  Из index.js не допускается что то экспортировать
*/

import { createCardElement, deleteCard, likeCard } from "./components/card.js";
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from "./components/modal.js";
import { enableValidation, clearValidation as clearValidation, } from "./components/validation.js";
import {
  getUserInfo,
  getCardList,
  updateProfileInfo,
  updateProfileAvatar,
  createCard,
  removeCard,
  toggleCardLike,
} from "./components/api.js";

const validationSettings = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

enableValidation(validationSettings);

// DOM узлы
const placesWrap = document.querySelector(".places__list");
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");

const deleteConfirmPopup = document.querySelector(".popup_type_remove-card");
const deleteConfirmForm = deleteConfirmPopup?.querySelector(".popup__form");

let userId = null;
let cardToDelete = null;
let cardToDeleteId = null;

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  profileForm.querySelector(".popup__button").textContent = "Сохранение...";
  updateProfileInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
    .then((userData) => {
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      closeModalWindow(profileFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
};

const handleAvatarFromSubmit = (evt) => {
  evt.preventDefault();
  avatarForm.querySelector(".popup__button").textContent = "Сохранение...";
  updateProfileAvatar(avatarInput.value)
    .then((userData) => {
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
      closeModalWindow(avatarFormModalWindow);
      avatarForm.reset();
    })
    .catch((err) => {
      console.log(err);
    })
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();
  cardForm.querySelector(".popup__button").textContent = "Создание...";
  createCard({
    name: cardNameInput.value,
    link: cardLinkInput.value,
  })
    .then((newCard) => {
      const likeHandler = (likeButton) => {
        const isCurrentlyLiked = likeButton.classList.contains("card__like-button_is-active");
        const likeCountElement = likeButton.closest('.card').querySelector(".card__like-count");

        toggleCardLike(newCard._id, isCurrentlyLiked)
          .then((updatedCard) => {
            likeCard(likeButton);
            if (likeCountElement) {
              likeCountElement.textContent = updatedCard.likes.length;
            }
          })
          .catch((err) => console.log(err));
      };

      const deleteHandler = (cardElement) => {
        cardToDelete = cardElement;
        cardToDeleteId = newCard._id;
        openModalWindow(deleteConfirmPopup);
      };

      const cardElement = createCardElement(
        newCard,
        {
          onPreviewPicture: handlePreviewPicture,
          onLikeIcon: likeHandler,
          onDeleteCard: deleteHandler,
        }
      );
      
      const likeCountElement = cardElement.querySelector(".card__like-count");
      if (likeCountElement) {
        likeCountElement.textContent = newCard.likes.length;
      }

      if (newCard.owner._id !== userId) {
        const deleteButton = cardElement.querySelector(".card__control-button_type_delete");
        if (deleteButton) deleteButton.remove();
      }

      placesWrap.prepend(cardElement);
      closeModalWindow(cardFormModalWindow);
      cardForm.reset();
      clearValidation({
      formElement: cardForm,
      ...validationSettings
    });
    })
    .catch((err) => {
      console.log(err);
    })
};

const handleDeleteConfirm = (evt) => {
  evt.preventDefault();
  const submitButton = deleteConfirmForm.querySelector(".popup__button");
  submitButton.textContent = "Удаление...";
  removeCard(cardToDeleteId)
    .then(() => {
      deleteCard(cardToDelete);
      closeModalWindow(deleteConfirmPopup);
    })
    .catch((err) => {
      console.log(err);
    })
};

profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFromSubmit);

if (deleteConfirmForm) {
  deleteConfirmForm.addEventListener("submit", handleDeleteConfirm);
}

openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  clearValidation({
    formElement: profileForm,
    ...validationSettings
  });
  openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  clearValidation({
    formElement: avatarForm,
    ...validationSettings
  });
  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  clearValidation({
    formElement: cardForm,
    ...validationSettings
  });
  openModalWindow(cardFormModalWindow);
});

Promise.all([getCardList(), getUserInfo()])
  .then(([cards, userData]) => {
    userId = userData._id;

    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`;

    cards.forEach((card) => {
      const likeHandler = (likeButton) => {
        const isCurrentlyLiked = likeButton.classList.contains("card__like-button_is-active");
        const likeCountElement = likeButton.closest('.card').querySelector(".card__like-count");
        
        toggleCardLike(card._id, isCurrentlyLiked)
          .then((updatedCard) => {
            likeCard(likeButton);
            if (likeCountElement) {
              likeCountElement.textContent = updatedCard.likes.length;
            }
          })
          .catch((err) => console.log(err));
      };

      const deleteHandler = (cardElement) => {
        cardToDelete = cardElement;
        cardToDeleteId = card._id;
        openModalWindow(deleteConfirmPopup);
      };

      const cardElement = createCardElement(
        card,
        {
          onPreviewPicture: handlePreviewPicture,
          onLikeIcon: likeHandler,
          onDeleteCard: deleteHandler,
        }
      );

      const likeCountElement = cardElement.querySelector(".card__like-count");
      if (likeCountElement) {
        likeCountElement.textContent = card.likes.length;
      }

      if (card.owner._id !== userId) {
        const deleteButton = cardElement.querySelector(".card__control-button_type_delete");
        if (deleteButton) deleteButton.remove();
      }

      placesWrap.append(cardElement);
    });
  })
  .catch((err) => {
    console.log(err);
  });

const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

// Вариант 3
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const handleLogoClick = () => {
  getCardList()
    .then((cards) => {
      const statsWindow = document.querySelector(".popup_type_info");
      const infoList = statsWindow.querySelector(".popup__info");
      const userList = statsWindow.querySelector(".popup__list");

      infoList.innerHTML = "";
      userList.innerHTML = "";

      const totalCards = cards.length;
      const firstCard = cards[cards.length - 1];
      const lastCard = cards[0];

      const uniqueUsers = new Map();
      cards.forEach(card => {
        uniqueUsers.set(card.owner._id, card.owner.name);
      });

      const createInfoItem = (term, description) => {
        const template = document.getElementById("popup-info-definition-template").content.cloneNode(true);
        template.querySelector(".popup__info-term").textContent = term;
        template.querySelector(".popup__info-description").textContent = description;
        return template;
      };

      const createUserBadge = (name) => {
        const template = document.getElementById("popup-info-user-preview-template").content.cloneNode(true);
        template.querySelector(".popup__list-item").textContent = name;
        return template;
      };

      infoList.append(createInfoItem("Всего карточек:", totalCards));
      infoList.append(createInfoItem("Первая создана:", formatDate(firstCard.createdAt)));
      infoList.append(createInfoItem("Последняя создана:", formatDate(lastCard.createdAt)));

      uniqueUsers.forEach(name => {
        userList.append(createUserBadge(name));
      });

      openModalWindow(statsWindow);
    })
    .catch(err => console.log(err));
};

const logo = document.querySelector(".logo");
if (logo) {
  logo.addEventListener("click", handleLogoClick);
}
