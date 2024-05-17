import React, { useEffect, useState } from "react";
import { Button, Card, Modal } from "react-bootstrap";
import { db } from "../Firebase/firebase";
import "../../../node_modules/bootstrap/dist/css/bootstrap.min.css";
import { collection, getDocs } from "firebase/firestore";
import { useSelector, useDispatch } from "react-redux";
import {
  setFbCategory,
  setFbType,
  setSelectedCategory,
  setCategoryAndTypes,
  setFbGeneratedDatas,
} from "../../Routes/Slices/templateSlice";
import './index.css'
import { useNavigate } from "react-router-dom";



const Template = () => {
  const navigate = useNavigate
  const dispatch = useDispatch();
  const {
    fbCategory,
    fbType,
    selectedCategory,
    categoryAndTypes,
    fbGeneratedDatas,
  } = useSelector((state) => state.template);
  const [selectType, setSelectType] = useState([]);
  const [newData, setNewData] = useState([]);
  const [content, setContent] = useState("");
  const [selectTemplate, setSelectTemplate] = useState("");
  const [regen, setRegen] = useState(false);

  console.log("selectTemplate",selectTemplate);

  const fetchCategory = async () => {
    const querySnapshot = await getDocs(collection(db, "category"));
    const categories = querySnapshot.docs.map((doc) => ({
      ...doc.data(),
    }));
    dispatch(setFbCategory(categories));
  };

  const fetchTypes = async () => {
    const querySnapShot = await getDocs(collection(db, "type"));
    const types = querySnapShot.docs.map((doc) => ({
      typeId: doc.id,
      ...doc.data(),
    }));
    dispatch(setFbType(types));
  };

  const fetchTemplate = async () => {
    const querySnapShot = await getDocs(collection(db, "generatedDatas"));
    const template = querySnapShot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    dispatch(setFbGeneratedDatas(template));
  };

  const fetchCategoryWithType = () => {
    const categoryTypes = fbCategory.map((category) => {
      const typesForCategory = fbType
        .filter((type) => type.categoryId === category.categoryId)
        .map((doc) => doc.type);
      return { category, types: typesForCategory };
    });
    const selectCat = categoryTypes.slice();
    dispatch(setCategoryAndTypes(selectCat));
  };

  const templateInsideTypes = () => {
    const cat = fbCategory.map((category) => {
      const typesForCategory = fbType
        .filter((type) => type.categoryId === category.categoryId)
        .map((type) => {
          const templatesForType = fbGeneratedDatas.filter(
            (data) => data.typeId === type.typeId
          );
          return {
            type: type.type,
            templates: templatesForType.map((template) => ({
              id: template.id,
              template: template.templates,
            })),
          };
        });
      return { category, types: typesForCategory };
    });
    setNewData(cat);
  };

  useEffect(() => {
    fetchCategory();
    fetchTypes();
    fetchCategoryWithType();
    fetchTemplate();
    templateInsideTypes();
  }, []);

  const handleCategoryClick = async (eachCategory) => {
    dispatch(setSelectedCategory(eachCategory));
  };

  const handleTypeClick = (clickType) => {
    const selectedTemplates = [];

    newData.forEach((user) => {
      user.types.forEach((type) => {
        if (type.type === clickType) {
          selectedTemplates.push({ type });
        }
      });
    });

    setSelectType(selectedTemplates);
    console.log('Selected Template',selectType)
  };

  const handleTemplateSelected = (temp) => {
    setSelectTemplate(temp);
    setRegen(true);
  };
  
const handleRegenerateToDashboard = () => navigate("/dashboard");
const handleToSend = () => navigate("/emailform")

  return (
    <div>
      <h2>Welcome to the template page</h2>
      <h5>Select Category</h5>
    {/* categoryAndTypes.length */}
      <div>
        {categoryAndTypes.map((category, i) => (
          <Card
            className="cards"
            onClick={() => handleCategoryClick(category)}
            key={i}
            style={{ width: "10rem", cursor: "pointer" }}
          >
            <Card.Body>
              <Card.Subtitle className="mb-2 text-muted">
                Category
              </Card.Subtitle>
              <Card.Title>{category.category.categoryName}</Card.Title>
            </Card.Body>
          </Card>
        ))}
      </div>
      {selectedCategory && (
        <div>
          <h5>Types for {selectedCategory.category.categoryName}</h5>
          {selectedCategory.types.map((type, i) => (
            <Card
              className="cardss"
              key={i}
              onClick={() => handleTypeClick(type)}
              data-index={i}
              style={{ width: "20.8rem" }}
            >
              <Card.Body>
                <Card.Subtitle className="mb-2 text-muted">
                  <h6>Type for {selectedCategory.category.categoryName}</h6>
                </Card.Subtitle>
                <Card.Title>{type}</Card.Title>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}
      {selectType.length > 0 && (
        <div>
          {selectType.map((doc, i) => (
            <div key={i}>
              <h5>Select Template for {doc.type.type}</h5>
              {doc.type.templates.map((temp, j) => (
                <Card
                  key={j}
                  className="cardss"
                  style={{ width: "30rem", marginBottom: "10px" }}
                  onClick={() => handleTemplateSelected(temp.template)}
                >
                  <Card.Body>
                    <div>{temp.template}</div>
                  </Card.Body>
                </Card>
              ))}
            </div>
          ))}
        </div>
      )}

      <Modal 
      show={regen} 
      onHide={() => setRegen(false)}
      size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        dialogClassName="modal-90w">
        {/* <center> */}
          <Modal.Header closeButton>
            <Modal.Title>Email Preview! You can edit your email!</Modal.Title>
          </Modal.Header>
          <Modal.Body>
          <div
            contentEditable
            onInput={(e) => setSelectTemplate(e.target.innerHTML)}
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              padding: "10px",
              fontFamily: "Arial, sans-serif",
              fontSize: "16px",
              backgroundColor: "#f9f9f9",
              resize: "none",
              // overflow: "hidden",
              whiteSpace: "pre-wrap",
              // wordWrap: "break-word",
            }}
            dangerouslySetInnerHTML={{ __html: selectTemplate }}
          />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setRegen(false)}>
              Close
            </Button>
            <Button variant="primary" onClick={() => setRegen(false)}>
             Save
            </Button>
            <button type="button" onClick={handleToSend }> Send </button>
          </Modal.Footer>
        {/* </center> */}
      </Modal>
      <button type="button" className="btn btn-info" onClick={handleRegenerateToDashboard}>re-Generate</button>
    </div>
  );
};

export default Template;
