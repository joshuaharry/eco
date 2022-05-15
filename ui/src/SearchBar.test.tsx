import SearchBar from './SearchBar';
import { render } from './testUtils';
describe("Our SearchBar component", () => {
	test("Does not crash on rendering", () => {
	  render(<SearchBar />);
	});
})
