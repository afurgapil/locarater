import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { FunnelIcon } from "@heroicons/react/24/solid";

export interface FilterOptions {
  minRating: number;
  maxRating: number;
  startDate: string;
  endDate: string;
  locationName: string;
}

const defaultFilters: FilterOptions = {
  minRating: 0,
  maxRating: 10,
  startDate: "",
  endDate: "",
  locationName: "",
};

interface ReviewFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterOptions;
  onApplyFilters: (filters: FilterOptions) => void;
}

export function ReviewFilterModal({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
}: ReviewFilterModalProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    onApplyFilters({
      minRating: Number(formData.get("minRating")) || 0,
      maxRating: Number(formData.get("maxRating")) || 10,
      startDate: formData.get("startDate")?.toString() || "",
      endDate: formData.get("endDate")?.toString() || "",
      locationName: formData.get("locationName")?.toString() || "",
    });

    onClose();
  };

  const hasActiveFilters =
    filters.minRating > defaultFilters.minRating ||
    filters.maxRating < defaultFilters.maxRating ||
    filters.startDate !== defaultFilters.startDate ||
    filters.endDate !== defaultFilters.endDate ||
    filters.locationName !== defaultFilters.locationName;

  const handleReset = () => {
    onApplyFilters(defaultFilters);
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="div"
                  className="flex justify-between items-center mb-4"
                >
                  <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white flex items-center gap-2">
                    <FunnelIcon className="h-5 w-5" />
                    Filtreleme Seçenekleri
                  </h3>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </Dialog.Title>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Mekan Adı
                    </label>
                    <input
                      type="text"
                      name="locationName"
                      defaultValue={filters.locationName}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Mekan adı ile filtrele"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Min Puan
                      </label>
                      <input
                        type="number"
                        name="minRating"
                        min="0"
                        max="10"
                        step="0.5"
                        defaultValue={filters.minRating}
                        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Max Puan
                      </label>
                      <input
                        type="number"
                        name="maxRating"
                        min="0"
                        max="10"
                        step="0.5"
                        defaultValue={filters.maxRating}
                        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Başlangıç Tarihi
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        defaultValue={filters.startDate}
                        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Bitiş Tarihi
                      </label>
                      <input
                        type="date"
                        name="endDate"
                        defaultValue={filters.endDate}
                        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={handleReset}
                        className="inline-flex justify-center rounded-md border border-red-300 dark:border-red-600 px-4 py-2 text-sm font-medium text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                      >
                        Filtreleri Sıfırla
                      </button>
                    )}
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      onClick={onClose}
                    >
                      Vazgeç
                    </button>
                    <button
                      type="submit"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                      Uygula
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
