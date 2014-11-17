var Label = React.createClass({
	render: function() {
		return (
			<div key={"label" + this.props.id} className="label">
				<div className="name">
					<span>{this.props.name}</span>
					<i className="fa fa-angle-down"></i>
				</div>
				<div className="content">
					{this.props.children}
				</div>
			</div>
		);
	}
});

module.exports = Label;