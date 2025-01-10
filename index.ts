import { generateWorld } from "./src/world";

const main = async () => {
  const world = await generateWorld({ seed: 1 });
  console.log(JSON.stringify(world, null, 2));
};

main();
