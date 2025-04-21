import { Button } from 'primereact/button'
import { Dropdown } from 'primereact/dropdown'
import { InputNumber } from 'primereact/inputnumber'
import { InputSwitch } from 'primereact/inputswitch'
import { InputText } from 'primereact/inputtext'
import React, { useEffect, useRef, useState } from 'react'
import API from '../../../utils/axios'
import { useSelector } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import { Toast } from 'primereact/toast'
import { Skeleton } from 'primereact/skeleton'

const ModifierCategory = () => {

  let toast = useRef(null)
  const navigate = useNavigate()

  let user = useSelector(state => state.auth)
  const { id } = useParams()

  const [formData, setFormData] = useState({
    modifierCategoryName: null,
    displayOrder: null,
    minimumSelection: null,
    maximumSelection: null,
    isFreeTagging: false,
    selectionMandatory: false,
  })

  const [errors, setErrors] = useState({
    modifierCategoryName: null,
    displayOrder: null,
    minimumSelection: null,
    maximumSelection: null,
    isFreeTagging: null,
    selectionMandatory: null,
  })

  const [loading, setLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)

  const inputChangeHandler = (e) => {
    const { name, value, type } = e.target;

    const newValue = type === 'checkbox' ? e.target.checked : value;

    setFormData((prev) => ({ ...prev, [name]: newValue }))
    setErrors((prev) => ({ ...prev, [name]: null }))


  }

  const checkValidation = (data) => {

    let errors = {}
    let isValid = true

    if (!data.modifierCategoryName || data.modifierCategoryName.trim() == "") {
      errors.modifierCategoryName = "Modifier Category Name is required"
      isValid = false
    }

    if (!data.displayOrder) {
      errors.displayOrder = "Display Order is required"
      isValid = false
    }


    if (!data.minimumSelection) {
      errors.minimumSelection = "Minimum Selection is required"
      isValid = false
    }

    if (!data.maximumSelection) {
      errors.maximumSelection = "Maximum Selection is required"
      isValid = false
    }

    if (data.minimumSelection > data.maximumSelection) {
      errors.minimumSelection = "Minimum Selection cannot be greater than Maximum Selection"
      isValid = false
    }

    setErrors(errors)
    return isValid

  }

  const addModifierCategoryHandler = async () => {


    try {

      let { modifierCategoryName, displayOrder, minimumSelection, maximumSelection, isFreeTagging, selectionMandatory } = formData

      let isValid = checkValidation({ modifierCategoryName, displayOrder, minimumSelection, maximumSelection, isFreeTagging, selectionMandatory })

      if (!isValid) {
        return;
      }

      setLoading(true)

      let response = await API.post(`modifier/${id ? 'updateModifierCategory/' + id : 'addModifierCategory'}`,
        {
          companyId: 5,
          modifierCategoryName,
          displayOrder,
          minimumSelection,
          maximumSelection,
          isFreeTagging: isFreeTagging ? 1 : 0,
          selectionMandatory: selectionMandatory ? 1 : 0
        }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        }
      })


      if (response.data.success) {
        toast.current.show({ severity: 'success', summary: 'Success', detail: response.data.msg, life: 2000 });

        if (id) {
          setTimeout(() => {
            navigate("/modifier-category-list")
          }, 2000);
        }

        setFormData({
          modifierCategoryName: '',
          displayOrder: '',
          minimumSelection: null,
          maximumSelection: null,
          isFreeTagging: false,
          selectionMandatory: false,
        });

      }


    } catch (error) {
      toast.current.show({ severity: 'error', summary: 'Error', detail: error?.response?.data.msg, life: 3000 });
    } finally {
      setLoading(false)
    }

  }

  const renderSkeleton = () => (
    <div className="card px-4 p-fluid product-master-card">
      <div className="flex flex-col lg:flex-row lg:gap-5 gap-1 w-full">
        <div className="field flex-1">
          <Skeleton width="40%" height="1.5rem" className="mb-2" />
          <Skeleton height="2.5rem" />
        </div>
        <div className="field flex-1">
          <Skeleton width="40%" height="1.5rem" className="mb-2" />
          <Skeleton height="2.5rem" />
        </div>
        <div className="field flex-1">
          <Skeleton width="40%" height="1.5rem" className="mb-2" />
          <Skeleton height="2.5rem" />
        </div>
      </div>
      <div className="flex flex-col lg:flex-row lg:gap-5 gap-1 w-full">
        <div className="field flex-1">
          <Skeleton width="40%" height="1.5rem" className="mb-2" />
          <Skeleton height="2.5rem" />
        </div>
        <div className="field flex-1">
          <Skeleton width="40%" height="1.5rem" className="mb-2" />
          <Skeleton height="2.5rem" />
        </div>
        <div className="field flex-1">
          <Skeleton width="40%" height="1.5rem" className="mb-2" />
          <Skeleton height="2.5rem" />
        </div>
      </div>
      <div className="flex flex-col lg:flex-row lg:gap-5 gap-1 w-full">
        <div className="gap-4 w-full flex justify-end mt-2">
          <Skeleton width="8rem" height="2.5rem" />
        </div>
      </div>
    </div>
  );

  const getModifierCategoryById = async (id) => {
    try {
      setIsInitialLoading(true);
      let response = await API.get(
        `modifier/getModifierCategorydata/${id}`,
        { headers: { Authorization: `Bearer ${user.token}`, 'Content-Type': 'application/json' } }
      );
      if (response.data.success) {
        let { displayorder, isfreetagging, maximumselection, minimumselection, modifiercategoryname, selectionmandatory } = response?.data.data[0]
        setFormData({
          modifierCategoryName: modifiercategoryname,
          displayOrder: displayorder,
          minimumSelection: minimumselection,
          maximumSelection: maximumselection,
          isFreeTagging: isfreetagging == 1 ? true : false,
          selectionMandatory: selectionmandatory == 1 ? true : false,
        })
      }
    } catch (error) {
      console.log(error)
    } finally {
      setIsInitialLoading(false);
    }
  }

  useEffect(() => {
    if (id) {
      getModifierCategoryById(id)
    }

  }, [id])



  return (
    <div>
      <Toast ref={toast} />
      <div className="card-action-menu  flex justify-content-between align-items-center">
        <div className='font-bold'>Modifier Category</div>
        <div className="hover:bg-gray-200 transition-colors p-1 border-round cursor-pointer">
          <i onClick={() => navigate("/modifier-category-list")} className="pi pi-list" style={{ fontSize: "1.3rem" }} />
        </div>
      </div>

      {isInitialLoading && id ? renderSkeleton() : (
        <div className='card px-4 p-fluid product-master-card'>
          <div className="flex  flex-col lg:flex-row lg:gap-5 gap-1 w-full">
            <div className="field flex-1">
              <label className='font-semibold' htmlFor="modifierCategoryName">Modifier Category Name</label>
              <InputText name="modifierCategoryName" value={formData.modifierCategoryName} onChange={inputChangeHandler} className="w-full" disabled={loading} />
              {errors?.modifierCategoryName && <p className='text-red-500 text-sm flex items-center gap-2 mt-2'><i className='pi pi-times-circle text-sm'></i> {errors?.modifierCategoryName}</p>}
            </div>
            <div className="field flex-1">
              <label className='font-semibold' htmlFor="displayOrder">Display Order</label>
              <InputNumber min={1} name="displayOrder" value={formData.displayOrder} onValueChange={inputChangeHandler} className="w-full" disabled={loading} />
              {errors?.displayOrder && <p className='text-red-500 text-sm flex items-center gap-2 mt-2'><i className='pi pi-times-circle text-sm'></i> {errors?.displayOrder}</p>}
            </div>
            <div className="field flex-1 gap-4 flex  items-center  justify-between mb-0">
              <label className='font-semibold mb-0'>Free Tagging</label>
              <InputSwitch
                checked={formData.isFreeTagging}
                onChange={inputChangeHandler}
                name="isFreeTagging"
                id="switch1"
                disabled={loading}
              />
            </div>
          </div>
          <div className="flex  flex-col lg:flex-row lg:gap-5 gap-1 w-full">
            <div className="field flex-1">
              <label className='font-semibold' htmlFor="minimumSelection">Minimum Selection</label>
              <InputNumber min={1} name="minimumSelection" value={formData.minimumSelection} onValueChange={inputChangeHandler} className="w-full" disabled={loading} />
              {errors?.minimumSelection && <p className='text-red-500 text-sm flex items-center gap-2 mt-2'><i className='pi pi-times-circle text-sm'></i> {errors?.minimumSelection}</p>}
            </div>
            <div className="field flex-1">
              <label className='font-semibold' htmlFor="maximumSelection">Maximum Selection</label>
              <InputNumber min={1} name="maximumSelection" value={formData.maximumSelection} onValueChange={inputChangeHandler} className="w-full" disabled={loading} />
              {errors?.maximumSelection && <p className='text-red-500 text-sm flex items-center gap-2 mt-2'><i className='pi pi-times-circle text-sm'></i> {errors?.maximumSelection}</p>}
            </div>
            <div className="field flex-1 gap-4 flex  items-center justify-between mb-0">
              <label className='font-semibold mb-0'>Selection Mandatory</label>
              <InputSwitch
                checked={formData.selectionMandatory}
                onChange={inputChangeHandler}
                name="selectionMandatory"
                id="switch4"
                disabled={loading}
              />
            </div>
          </div>
          <div className="flex  flex-col lg:flex-row lg:gap-5 gap-1 w-full">
            <div className="gap-4 w-full flex justify-end mt-2">
              <Button onClick={addModifierCategoryHandler} className="p-button-sm p-button-primary w-fit px-4 font-bold" disabled={loading}>
                {id ? "Update Modifier Category" : "Add Modifier Category"}
                {loading && <i className="pi pi-spin pi-spinner ml-2" style={{ fontSize: '1rem' }}></i>}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ModifierCategory
