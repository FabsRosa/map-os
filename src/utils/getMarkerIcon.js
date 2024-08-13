// Retorna endereço do ícone, com base no técnico designado
const getMarkerIcon = (isHighlighted, nometec, tec) => {
  const color = tec ? (tec.color ? tec.color : 'yellow' ) : 'yellow';
  const isTerceirizado = color == 'yellow';
  return `/pin/${color}${isHighlighted ? (
      `-dot`
    ) : (
      `${!isTerceirizado ? (
        nometec ? (
          `-${nometec.charAt(0).toLowerCase()}` // First letter of the name
        ) : (
          ``
        )
      ) : (
        `-t` // Terceirizado
      )}`
    )}.png`;
};

export default getMarkerIcon;