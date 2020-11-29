import React, { useState, useEffect, useContext } from "react";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import { Button } from "@material-ui/core";
import ProductRepository from "../../repository/ProductRepository";
import { NotificationManager } from "react-notifications";
import SaveIcon from "@material-ui/icons/Save";
import { withFirebase } from "../Firebase";
import { AuthUserContext } from "../Session";

function EditOrAddProduct(props) {
  const product_id = props.match.params.id;
  const [product, setProduct] = useState({});

  const authUser = useContext(AuthUserContext);
  ProductRepository.setOrderRepositoryFirebase(props.firebase, authUser);

  useEffect(() => {
    setProduct(ProductRepository.getById(product_id));
  }, [product_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const isEmpty = (value) => !value || value === "";

  const saveProduct = () => {
    const { description, cash, card } = product;
    if (isEmpty(description) || isEmpty(cash) || isEmpty(card)) {
      NotificationManager.error(
        `Todos os campos são obrigatórios`,
        "Error ao salvar Produto"
      );
      return;
    }
    product.description = product.description.toUpperCase();
    ProductRepository.save(product);
    props.history.push(`/products`);
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <TextField
          id="description"
          label="Descrição"
          style={{ margin: 8 }}
          fullWidth
          margin="normal"
          value={product.description}
          name="description"
          onChange={handleChange}
          required
          autoFocus
        />
        <TextField
          id="cash-price"
          label="Valor em Dinheiro"
          style={{ margin: 8 }}
          placeholder=""
          fullWidth
          margin="normal"
          value={product.cash}
          name="cash"
          onChange={handleChange}
          type="number"
          startAdornment={<InputAdornment position="start">R$</InputAdornment>}
          required
        />
        <TextField
          id="card-price"
          label="Valor em Cartão"
          style={{ margin: 8 }}
          placeholder=""
          fullWidth
          margin="normal"
          value={product.card}
          name="card"
          onChange={handleChange}
          type="number"
          startAdornment={<InputAdornment position="start">R$</InputAdornment>}
          required
          InputProps={{ step: "0.01" }}
        />
      </Grid>
      <Grid item xs={12}>
        <Button
          fullWidth
          onClick={saveProduct}
          color="primary"
          variant="contained"
          startIcon={<SaveIcon />}
        >
          Salvar
        </Button>
      </Grid>
    </Grid>
  );
}

export default withFirebase(EditOrAddProduct);
