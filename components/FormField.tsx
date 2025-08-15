/**
 * This code defines a functional component named `FormField` in TypeScript for a form input field. The
 * component takes in several props as an object destructuring assignment:
 * @param id - The unique identifier for the form field.
 * @param label - The label text for the form field.
 * @param type - The type of input for the form field (e.g., "text", "password", "email", etc.).
 * @param value - The current value of the form field.
 * @param onChange - The event handler function to be called when the value of the form field changes.
 * @param placeholder - The placeholder text for the form field.
 * @param as - The type of form field to render (e.g., "input", "textarea", "select").
 * @param options - The options for a select form field.
 * @returns The rendered form field component.
 **/
const FormField = ({
	id,
	label,
	type = "text",
	value,
	onChange,
	placeholder,
	as = "input",
	options = [],
}: FormFieldProps) => (
	<div className="form-field">
		<label htmlFor={id}>{label}</label>
		{as === "textarea" ? (
			<textarea
				id={id}
				name={id}
				value={value}
				onChange={onChange}
				placeholder={placeholder}
			/>
		) : as === "select" ? (
			<select id={id} name={id} value={value} onChange={onChange}>
				{options.map((option) => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
		) : (
			<input
				type={type}
				id={id}
				name={id}
				value={value}
				onChange={onChange}
				placeholder={placeholder}
			/>
		)}
	</div>
);

export default FormField;
