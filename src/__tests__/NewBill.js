/**
 * @jest-environment jsdom
 */

import { fireEvent, screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import userEvent from "@testing-library/user-event"

import { ROUTES, ROUTES_PATH } from "../constants/routes"
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockedBills from "../__mocks__/store.js";



describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {

    describe("When I change the file, and a wrong file is selected", () => {
        test("Then an error message should be displayed and the button should be disabled", () => {

          jest.mock("../app/store", () => mockedBills)

          Object.defineProperty(window, 'localStorage', { value: localStorageMock })
          window.localStorage.setItem('user', JSON.stringify({
            type: 'Employee',
            email: 'a@a'
          }))

          const html = NewBillUI()
          document.body.innerHTML = html

          const onNavigate = pathname => {
            document.body.innerHTML = ROUTES({ pathname })
          };

          const newBill = new NewBill({
            document, onNavigate,  store: mockedBills, localStorage: window.localStorage
          })

          const file = new File(['test'], 'test.html', { type: 'text/html' })

          const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e))

          const input = screen.getByTestId("file")
          input.addEventListener('change', handleChangeFile)

          userEvent.upload(input, file);
          fireEvent(input, new Event('change'))

          expect(handleChangeFile).toHaveBeenCalled();
          expect(document.getElementById('errorMsg').style.display).toBe('block');
          expect(document.getElementById('btn-send-bill').disabled).toBe(true);

          expect(jest.spyOn(mockedBills, 'bills')).not.toHaveBeenCalled();

          jest.clearAllMocks();
        })
    })


    describe("A valid file is selected", () => {
      test("Then there is no error message and the button should be enabled", () => {

        jest.mock("../app/store", () => mockedBills)

        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee',
          email: 'a@a'
        }))

        const html = NewBillUI()
        document.body.innerHTML = html

        const onNavigate = pathname => {
          document.body.innerHTML = ROUTES({ pathname })
        };

        const newBill = new NewBill({
          document, onNavigate,  store: mockedBills, localStorage: window.localStorage
        })

        const file = new File(['test'], 'test.png', { type: 'image/png' })
        
        const input = screen.getByTestId("file")

        userEvent.upload(input, file);
        const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e))
        input.addEventListener('change', handleChangeFile)
        fireEvent(input, new Event('change'))

        expect(handleChangeFile).toHaveBeenCalled();
        expect(document.getElementById('errorMsg').style.display).toBe('none');
        expect(document.getElementById('btn-send-bill').disabled).toBe(false);

        expect(jest.spyOn(mockedBills, 'bills')).toHaveBeenCalled();

        jest.clearAllMocks();
      })
    })

    describe("When I submit the new bill", () => {

      jest.mock("../app/store", () => mockedBills)

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: 'a@a'
      }))

      const html = NewBillUI()
      document.body.innerHTML = html

      const onNavigate = pathname => {
        document.body.innerHTML = ROUTES({ pathname })
      };

      const newBill = new NewBill({
        document, onNavigate,  store: mockedBills, localStorage: window.localStorage
      })


      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))

      const form = screen.getByTestId('form-new-bill');

      form.addEventListener('submit', handleSubmit);
      fireEvent.submit(form)
      expect(handleSubmit).toHaveBeenCalled()
    })
  })

  describe("When I am on the NewBill page and the API returns an error", () => {
    jest.mock("../app/store", () => mockedBills)

    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(mockedBills, "bills");

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: 'a@a'
      }))

      const html = NewBillUI()
      document.body.innerHTML = html

      const onNavigate = pathname => {
        document.body.innerHTML = ROUTES({ pathname })
      };

      const newBill = new NewBill({
        document, onNavigate,  store: mockedBills, localStorage: window.localStorage
      })

      mockedBills.bills.mockImplementationOnce(() => {
        return {
          create: jest.fn().mockRejectedValueOnce(false)
        };
      });

      const file = new File(['test'], 'test.png', { type: 'image/png' })
      
      const input = screen.getByTestId("file")

      try {
        userEvent.upload(input, file);
        const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e))
        input.addEventListener('change', handleChangeFile)
        fireEvent(input, new Event('change'))
      } catch(error) {
        expect(error).toMatch("error")
      }

      jest.clearAllMocks();
  })
})