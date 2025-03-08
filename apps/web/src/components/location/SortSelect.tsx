import { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/24/solid";

export type SortOption = {
  id: string;
  name: string;
  value: string;
};

const sortOptions: SortOption[] = [
  { id: "1", name: "Önerilen", value: "recommended" },
  { id: "2", name: "En Yüksek Puan", value: "rating-desc" },
  { id: "3", name: "En Düşük Puan", value: "rating-asc" },
  { id: "4", name: "En Çok Değerlendirilen", value: "reviews-desc" },
  { id: "5", name: "En Az Değerlendirilen", value: "reviews-asc" },
  { id: "6", name: "En Yeni Eklenen", value: "date-desc" },
  { id: "7", name: "En Eski Eklenen", value: "date-asc" },
  { id: "8", name: "İsim (A-Z)", value: "name-asc" },
  { id: "9", name: "İsim (Z-A)", value: "name-desc" },
  { id: "10", name: "Şehir (A-Z)", value: "city-asc" },
  { id: "11", name: "Şehir (Z-A)", value: "city-desc" },
  { id: "12", name: "İlçe (A-Z)", value: "district-asc" },
  { id: "13", name: "İlçe (Z-A)", value: "district-desc" },
];

interface SortSelectProps {
  selected: SortOption;
  onChange: (option: SortOption) => void;
}

export function SortSelect({ selected, onChange }: SortSelectProps) {
  return (
    <Listbox value={selected} onChange={onChange}>
      <div className="relative h-full">
        <Listbox.Button className="relative w-full h-full cursor-pointer rounded-lg bg-white dark:bg-gray-800 py-2 pl-3 pr-10 text-left border border-gray-300 dark:border-gray-600 focus:outline-none focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-300 sm:text-sm sm:min-h-[38px]">
          <span className="block truncate">{selected.name}</span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronUpDownIcon
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </span>
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {sortOptions.map((option) => (
              <Listbox.Option
                key={option.id}
                className={({ active }) =>
                  `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                    active
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100"
                      : "text-gray-900 dark:text-gray-100"
                  }`
                }
                value={option}
              >
                {({ selected }) => (
                  <>
                    <span
                      className={`block truncate ${
                        selected ? "font-medium" : "font-normal"
                      }`}
                    >
                      {option.name}
                    </span>
                    {selected ? (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600 dark:text-blue-400">
                        <svg
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                    ) : null}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
}

export { sortOptions };
