export const loadingAnimationTestPlugin = {
  name: "loading-animation-test-stub",
  transform: (_code, id) => {
    if (!id.endsWith("/LoadingAnimation/LoadingAnimation.tsx")) {
      return null;
    }

    return {
      code: "export default function LoadingAnimation() { return null; }",
      moduleType: "js",
    };
  },
};
