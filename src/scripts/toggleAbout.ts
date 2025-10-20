export default () => {
  const trigger = document.querySelector(".about-top-container-text-more");
  const target = document.querySelector(".about-top-container-icons");

  if (!trigger || !target) return;

  trigger.addEventListener("click", (e) => {
    e.preventDefault();
    target.classList.toggle("hidden");
  });
};
